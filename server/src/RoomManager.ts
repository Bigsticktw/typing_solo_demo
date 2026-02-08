import type { Room, RoomListItem, GameConfig, Player } from './types.js';
import { generateCharSequence } from './utils/charGenerator.js';

export class RoomManager {
    private rooms: Map<string, Room> = new Map();

    /**
     * 建立新房間
     */
    createRoom(name: string, config: GameConfig, creator: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'>): Room {
        const roomId = this.generateRoomId();

        const player: Player = {
            ...creator,
            score: 0,
            errors: 0,
            currentIndex: 0,
            isReady: false,
            isConnected: true,
        };

        const room: Room = {
            id: roomId,
            name,
            players: new Map([[player.id, player]]),
            maxPlayers: 4, // 最多 4 人
            status: 'waiting',
            gameConfig: config,
            charSequence: [],
            createdAt: Date.now(),
        };

        this.rooms.set(roomId, room);
        return room;
    }

    /**
     * 加入房間
     */
    joinRoom(roomId: string, player: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'>): Room | null {
        const room = this.rooms.get(roomId);

        if (!room) {
            return null;
        }

        if (room.status !== 'waiting') {
            throw new Error('遊戲已開始，無法加入');
        }

        if (room.players.size >= room.maxPlayers) {
            throw new Error('房間已滿');
        }

        const newPlayer: Player = {
            ...player,
            score: 0,
            errors: 0,
            currentIndex: 0,
            isReady: false,
            isConnected: true,
        };

        room.players.set(player.id, newPlayer);
        return room;
    }

    /**
     * 離開房間
     */
    leaveRoom(roomId: string, playerId: string): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.players.delete(playerId);

        // 如果房間沒人了就刪除
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
        }
    }

    /**
     * 取得房間
     */
    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    /**
     * 取得所有房間列表
     */
    getRoomList(): RoomListItem[] {
        return Array.from(this.rooms.values())
            .filter(room => room.status === 'waiting') // 只顯示等待中的房間
            .map(room => this.toRoomListItem(room));
    }

    /**
     * 設定玩家準備狀態
     */
    setPlayerReady(roomId: string, playerId: string, isReady: boolean): boolean {
        const room = this.rooms.get(roomId);
        if (!room) return false;

        const player = room.players.get(playerId);
        if (!player) return false;

        player.isReady = isReady;
        return true;
    }

    /**
     * 檢查是否所有玩家都準備好
     */
    isAllPlayersReady(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.players.size === 0) return false;

        return Array.from(room.players.values()).every(p => p.isReady);
    }

    /**
     * 開始遊戲
     */
    startGame(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // 生成字符序列（根據遊戲時長計算所需字符數）
        const estimatedChars = Math.ceil(room.gameConfig.duration * 3); // 假設平均每秒 3 個字符
        room.charSequence = generateCharSequence(room.gameConfig, estimatedChars);

        room.status = 'playing';
        room.startTime = Date.now();
        room.endTime = room.startTime + room.gameConfig.duration * 1000;

        // 重置所有玩家狀態
        room.players.forEach(player => {
            player.score = 0;
            player.errors = 0;
            player.currentIndex = 0;
        });
    }

    /**
     * 結束遊戲
     */
    endGame(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.status = 'finished';

        // 重置玩家準備狀態
        room.players.forEach(player => {
            player.isReady = false;
        });
    }

    /**
     * 更新玩家遊戲狀態
     */
    updatePlayerProgress(roomId: string, playerId: string, isCorrect: boolean): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.status !== 'playing') return false;

        const player = room.players.get(playerId);
        if (!player) return false;

        if (isCorrect) {
            player.score++;
            player.currentIndex++;
        } else {
            player.errors++;
        }

        return true;
    }

    /**
     * 快速配對：找到一個等待中的房間，或建立新房間
     */
    quickMatch(config: GameConfig, player: Omit<Player, 'score' | 'errors' | 'currentIndex' | 'isReady'>): Room {
        // 尋找相同設定且等待中的房間
        const availableRoom = Array.from(this.rooms.values()).find(room =>
            room.status === 'waiting' &&
            room.players.size < room.maxPlayers &&
            this.isConfigMatch(room.gameConfig, config)
        );

        if (availableRoom) {
            return this.joinRoom(availableRoom.id, player)!;
        }

        // 沒有合適的房間，建立新的
        return this.createRoom('快速配對房間', config, player);
    }

    /**
     * 設定玩家連線狀態
     */
    setPlayerConnection(roomId: string, playerId: string, isConnected: boolean): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.get(playerId);
        if (player) {
            player.isConnected = isConnected;
        }
    }

    /**
     * 比較遊戲設定是否相同
     */
    private isConfigMatch(config1: GameConfig, config2: GameConfig): boolean {
        return config1.mode === config2.mode &&
            config1.duration === config2.duration &&
            config1.caseMode === config2.caseMode;
    }

    /**
     * 生成隨機房間 ID
     */
    private generateRoomId(): string {
        return Math.random().toString(36).substring(2, 9).toUpperCase();
    }

    /**
     * 將 Room 轉換為 RoomListItem
     */
    private toRoomListItem(room: Room): RoomListItem {
        return {
            id: room.id,
            name: room.name,
            playerCount: room.players.size,
            maxPlayers: room.maxPlayers,
            status: room.status,
            gameConfig: room.gameConfig,
        };
    }
}
