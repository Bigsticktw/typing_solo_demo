import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    Player,
    GameUpdate
} from './types.js';
import { RoomManager } from './RoomManager.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
        origin: '*', // 開發環境允許所有來源，生產環境應設定具體域名
        methods: ['GET', 'POST']
    }
});

const roomManager = new RoomManager();
const PORT = process.env.PORT || 3001;

// 玩家 Socket ID 到玩家 ID 的映射
const socketToPlayer = new Map<string, { playerId: string; roomId?: string }>();

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // 房間建立
    socket.on('room:create', ({ name, config, playerName }) => {
        try {
            const playerId = generatePlayerId();
            const player: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'> = {
                id: playerId,
                socketId: socket.id,
                name: playerName,
                isConnected: true,
            };

            const room = roomManager.createRoom(name, config, player);

            socket.join(room.id);
            socketToPlayer.set(socket.id, { playerId, roomId: room.id });
            socket.data.playerId = playerId;
            socket.data.roomId = room.id;

            // 通知建立者
            socket.emit('room:joined', {
                room: {
                    id: room.id,
                    name: room.name,
                    playerCount: room.players.size,
                    maxPlayers: room.maxPlayers,
                    status: room.status,
                    gameConfig: room.gameConfig,
                },
                players: Array.from(room.players.values()),
            });

            // 廣播房間列表更新
            io.emit('room:list', roomManager.getRoomList());

            console.log(`[Room] Created: ${room.id} by ${playerName}`);
        } catch (error) {
            socket.emit('error', error instanceof Error ? error.message : '建立房間失敗');
        }
    });

    // 加入房間
    socket.on('room:join', ({ roomId, playerName }) => {
        try {
            const playerId = generatePlayerId();
            const player: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'> = {
                id: playerId,
                socketId: socket.id,
                name: playerName,
                isConnected: true,
            };

            const room = roomManager.joinRoom(roomId, player);
            if (!room) {
                socket.emit('error', '房間不存在');
                return;
            }

            socket.join(roomId);
            socketToPlayer.set(socket.id, { playerId, roomId });
            socket.data.playerId = playerId;
            socket.data.roomId = roomId;

            // 通知加入者
            socket.emit('room:joined', {
                room: {
                    id: room.id,
                    name: room.name,
                    playerCount: room.players.size,
                    maxPlayers: room.maxPlayers,
                    status: room.status,
                    gameConfig: room.gameConfig,
                },
                players: Array.from(room.players.values()),
            });

            // 通知房間內其他玩家
            const newPlayer = room.players.get(playerId)!;
            socket.to(roomId).emit('player:joined', newPlayer);

            // 廣播房間列表更新
            io.emit('room:list', roomManager.getRoomList());

            console.log(`[Room] ${playerName} joined room ${roomId}`);
        } catch (error) {
            socket.emit('error', error instanceof Error ? error.message : '加入房間失敗');
        }
    });

    // 離開房間
    socket.on('room:leave', () => {
        const playerData = socketToPlayer.get(socket.id);
        if (!playerData || !playerData.roomId) return;

        const { playerId, roomId } = playerData;

        socket.leave(roomId);
        roomManager.leaveRoom(roomId, playerId);
        socketToPlayer.delete(socket.id);

        // 通知房間內其他玩家
        socket.to(roomId).emit('player:left', playerId);

        // 廣播房間列表更新
        io.emit('room:list', roomManager.getRoomList());

        socket.emit('room:left');
        console.log(`[Room] Player ${playerId} left room ${roomId}`);
    });

    // 取得房間列表
    socket.on('room:list', () => {
        socket.emit('room:list', roomManager.getRoomList());
    });

    // 快速配對
    socket.on('room:quickMatch', ({ config, playerName }) => {
        try {
            const playerId = generatePlayerId();
            const player: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'> = {
                id: playerId,
                socketId: socket.id,
                name: playerName,
                isConnected: true,
            };

            const room = roomManager.quickMatch(config, player);

            socket.join(room.id);
            socketToPlayer.set(socket.id, { playerId, roomId: room.id });
            socket.data.playerId = playerId;
            socket.data.roomId = room.id;

            // 通知加入者
            socket.emit('room:joined', {
                room: {
                    id: room.id,
                    name: room.name,
                    playerCount: room.players.size,
                    maxPlayers: room.maxPlayers,
                    status: room.status,
                    gameConfig: room.gameConfig,
                },
                players: Array.from(room.players.values()),
            });

            // 如果不是房主（房間已存在），通知其他玩家
            if (room.players.size > 1) {
                const newPlayer = room.players.get(playerId)!;
                socket.to(room.id).emit('player:joined', newPlayer);
            }

            // 廣播房間列表更新
            io.emit('room:list', roomManager.getRoomList());

            console.log(`[QuickMatch] ${playerName} matched to room ${room.id}`);
        } catch (error) {
            socket.emit('error', error instanceof Error ? error.message : '快速配對失敗');
        }
    });

    // 玩家準備
    socket.on('player:ready', (isReady) => {
        const playerData = socketToPlayer.get(socket.id);
        if (!playerData || !playerData.roomId) return;

        const { playerId, roomId } = playerData;

        roomManager.setPlayerReady(roomId, playerId, isReady);

        // 廣播給房間內所有人
        io.to(roomId).emit('player:ready', playerId, isReady);

        // 如果所有人都準備好了，開始遊戲
        if (isReady && roomManager.isAllPlayersReady(roomId)) {
            startGame(roomId);
        }
    });

    // 玩家輸入
    socket.on('game:input', ({ char, isCorrect }) => {
        const playerData = socketToPlayer.get(socket.id);
        if (!playerData || !playerData.roomId) return;

        const { playerId, roomId } = playerData;
        const room = roomManager.getRoom(roomId);

        if (!room || room.status !== 'playing') return;

        // 更新玩家進度
        roomManager.updatePlayerProgress(roomId, playerId, isCorrect);

        // 廣播遊戲狀態更新
        const updates: GameUpdate[] = Array.from(room.players.values()).map(p => ({
            playerId: p.id,
            score: p.score,
            errors: p.errors,
            currentIndex: p.currentIndex,
        }));

        io.to(roomId).emit('game:update', updates);
    });

    // 斷線處理
    socket.on('disconnect', () => {
        const playerData = socketToPlayer.get(socket.id);
        if (playerData && playerData.roomId) {
            const { playerId, roomId } = playerData;

            roomManager.setPlayerConnection(roomId, playerId, false);
            socket.to(roomId).emit('player:disconnected', playerId);

            // 延遲刪除玩家（給予重連機會）
            setTimeout(() => {
                const stillDisconnected = socketToPlayer.get(socket.id);
                if (stillDisconnected) {
                    roomManager.leaveRoom(roomId, playerId);
                    socket.to(roomId).emit('player:left', playerId);
                    socketToPlayer.delete(socket.id);
                    io.emit('room:list', roomManager.getRoomList());
                }
            }, 30000); // 30 秒後移除
        }

        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

/**
 * 開始遊戲
 */
function startGame(roomId: string) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    roomManager.startGame(roomId);

    // 廣播遊戲開始
    io.to(roomId).emit('game:start', {
        charSequence: room.charSequence,
        startTime: room.startTime!,
    });

    console.log(`[Game] Started in room ${roomId}`);

    // 設定遊戲結束計時器
    setTimeout(() => {
        endGame(roomId);
    }, room.gameConfig.duration * 1000);
}

/**
 * 結束遊戲
 */
function endGame(roomId: string) {
    const room = roomManager.getRoom(roomId);
    if (!room || room.status !== 'playing') return;

    roomManager.endGame(roomId);

    // 廣播遊戲結束
    io.to(roomId).emit('game:end', {
        players: Array.from(room.players.values()),
        duration: room.gameConfig.duration,
    });

    console.log(`[Game] Ended in room ${roomId}`);
}

/**
 * 生成隨機玩家 ID
 */
function generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 簡單的健康檢查端點
app.get('/health', (req, res) => {
    res.json({ status: 'ok', rooms: roomManager.getRoomList().length });
});

httpServer.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
});
