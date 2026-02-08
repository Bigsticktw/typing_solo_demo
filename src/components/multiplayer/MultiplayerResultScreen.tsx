import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { Trophy, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export function MultiplayerResultScreen() {
    const {
        roomPlayers,
        playerStats,
        playerId,
        currentRoom,
        leaveRoom,
        setReady,
    } = useMultiplayerStore();

    // 計算排名
    const rankings = roomPlayers
        .map(player => {
            const stats = playerStats.get(player.id);
            const accuracy = stats ? Math.round((stats.score / (stats.score + stats.errors)) * 100) : 0;
            const ppm = currentRoom
                ? Math.round((stats?.score ?? 0) / (currentRoom.gameConfig.duration / 60))
                : 0;

            return {
                ...player,
                stats,
                accuracy,
                ppm,
            };
        })
        .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0));

    const myRank = rankings.findIndex(r => r.id === playerId) + 1;

    const handlePlayAgain = () => {
        setReady(true);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="bg-[var(--keyboard-bg)] p-8 rounded-2xl shadow-2xl border border-[var(--text-secondary)]/10 max-w-4xl w-full">
                {/* 標題 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">遊戲結束！</h1>
                    <p className="text-xl opacity-70">
                        你的排名: <span className="text-[var(--accent)] font-bold">#{myRank}</span>
                    </p>
                </div>

                {/* 排行榜 */}
                <div className="space-y-4 mb-8">
                    {rankings.map((player, index) => (
                        <div
                            key={player.id}
                            className={clsx(
                                "bg-[var(--bg-primary)] p-6 rounded-xl border-2 transition-all",
                                player.id === playerId
                                    ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent)]/50"
                                    : "border-transparent",
                                index === 0 && "ring-2 ring-yellow-500/50"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                {/* 排名與玩家 */}
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold font-mono w-12 text-center">
                                        {index + 1}
                                    </div>
                                    {index === 0 && <Trophy className="text-yellow-500" size={32} />}
                                    {index === 1 && <Trophy className="text-gray-400" size={28} />}
                                    {index === 2 && <Trophy className="text-amber-600" size={24} />}
                                    <div>
                                        <p className="text-xl font-bold">
                                            {player.name}
                                            {player.id === playerId && (
                                                <span className="text-[var(--accent)] ml-2 text-sm">(你)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* 統計數據 */}
                                <div className="flex gap-8 text-center">
                                    <div>
                                        <div className="text-sm opacity-50">分數</div>
                                        <div className="text-2xl font-bold text-[var(--accent)]">
                                            {player.stats?.score ?? 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-50">準確率</div>
                                        <div className="text-2xl font-bold text-green-500">
                                            {player.accuracy}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-50">PPM</div>
                                        <div className="text-2xl font-bold">
                                            {player.ppm}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-50">錯誤</div>
                                        <div className="text-2xl font-bold text-red-500">
                                            {player.stats?.errors ?? 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 操作按鈕 */}
                <div className="flex gap-4">
                    <button
                        onClick={handlePlayAgain}
                        className="flex-1 px-6 py-4 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-bold text-lg hover:opacity-90 flex items-center justify-center gap-2 shadow-[0_0_20px_var(--accent)]/50"
                    >
                        <RotateCcw size={20} />
                        再玩一局
                    </button>

                    <button
                        onClick={leaveRoom}
                        className="px-6 py-4 bg-red-500/20 border-2 border-red-500 text-red-500 rounded-xl font-bold text-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                        離開房間
                    </button>
                </div>
            </div>
        </div>
    );
}
