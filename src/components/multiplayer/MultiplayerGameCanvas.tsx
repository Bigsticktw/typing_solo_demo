import { useEffect, useRef, useState } from 'react';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap } from 'lucide-react';
import clsx from 'clsx';

export function MultiplayerGameCanvas() {
    const {
        charSequence,
        currentCharIndex,
        gameStartTime,
        roomPlayers,
        playerStats,
        playerId,
        sendInput,
        status,
    } = useMultiplayerStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [timeLeft, setTimeLeft] = useState(0);

    const currentChar = charSequence[currentCharIndex] || '';
    const myStats = playerId ? playerStats.get(playerId) : null;

    // 計時器
    useEffect(() => {
        if (!gameStartTime || status !== 'playing') return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - gameStartTime;
            const room = useMultiplayerStore.getState().currentRoom;
            if (!room) return;

            const remaining = Math.max(0, room.gameConfig.duration * 1000 - elapsed);
            setTimeLeft(Math.ceil(remaining / 1000));

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [gameStartTime, status]);

    // 輸入處理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'playing' || !currentChar) return;

            const isCorrect = e.key === currentChar;
            sendInput(e.key, isCorrect);

            setFeedback(isCorrect ? 'correct' : 'wrong');
            setTimeout(() => setFeedback('idle'), 300);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, currentChar, sendInput]);

    // 聚焦輸入框
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // 計算排名
    const rankings = roomPlayers
        .map(player => ({
            ...player,
            stats: playerStats.get(player.id),
        }))
        .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0));

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* 隱藏輸入框 */}
            <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 pointer-events-none"
                autoFocus
            />

            {/* 頂部資訊列 */}
            <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-sm opacity-50">時間</div>
                        <div className="text-3xl font-bold font-mono">{timeLeft}s</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm opacity-50">分數</div>
                        <div className="text-3xl font-bold font-mono text-[var(--accent)]">
                            {myStats?.score ?? 0}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm opacity-50">錯誤</div>
                        <div className="text-3xl font-bold font-mono text-red-500">
                            {myStats?.errors ?? 0}
                        </div>
                    </div>
                </div>

                {/* 排名顯示 */}
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={24} />
                    <span className="text-sm opacity-50">排名:</span>
                    <span className="text-2xl font-bold">
                        #{rankings.findIndex(r => r.id === playerId) + 1}
                    </span>
                </div>
            </div>

            {/* 字符顯示區 */}
            <div className="mb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCharIndex}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className={clsx(
                            "text-[120px] font-bold font-mono select-none transition-all duration-200",
                            feedback === 'correct' && "text-green-500",
                            feedback === 'wrong' && "text-red-500 animate-shake",
                            feedback === 'idle' && "text-[var(--text-primary)]"
                        )}
                    >
                        {currentChar || '—'}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 玩家排行榜 */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {rankings.map((player, index) => (
                    <div
                        key={player.id}
                        className={clsx(
                            "bg-[var(--keyboard-bg)] p-4 rounded-xl border-2 transition-all",
                            player.id === playerId
                                ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent)]/50"
                                : "border-transparent",
                            index === 0 && "ring-2 ring-yellow-500/50"
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {index === 0 && <Trophy className="text-yellow-500" size={16} />}
                                <span className="font-bold">{player.name}</span>
                            </div>
                            <span className="text-sm opacity-50">#{index + 1}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                                <Target size={14} className="text-green-500" />
                                {player.stats?.score ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap size={14} className="text-red-500" />
                                {player.stats?.errors ?? 0}
                            </span>
                        </div>
                        {/* 進度條 */}
                        <div className="mt-2 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--accent)] transition-all duration-300"
                                style={{
                                    width: `${Math.min(100, ((player.stats?.currentIndex ?? 0) / charSequence.length) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
