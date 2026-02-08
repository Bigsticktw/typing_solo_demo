import { useMemo } from 'react';
import { type GameSession } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { KEYBOARD_LAYOUT } from '../../utils/layoutMaps';
import { motion } from 'framer-motion';

interface Props {
    history: GameSession[];
}

export const GlobalHeatmap = ({ history }: Props) => {
    const { gameMode } = useSettingsStore();

    // 聚合所有歷史數據
    const globalStats = useMemo(() => {
        const stats: Record<string, { totalLat: number; count: number; errors: number }> = {};

        history.forEach(session => {
            // 聚合延遲
            Object.entries(session.keyLatencies).forEach(([code, lats]) => {
                if (!stats[code]) stats[code] = { totalLat: 0, count: 0, errors: 0 };
                stats[code].totalLat += lats.reduce((a, b) => a + b, 0);
                stats[code].count += lats.length;
            });

            // 聚合錯誤
            Object.entries(session.keyErrors).forEach(([code, errs]) => {
                if (!stats[code]) stats[code] = { totalLat: 0, count: 0, errors: 0 };
                stats[code].errors += errs;
            });
        });

        return stats;
    }, [history]);

    const getKeyHeatColor = (code: string) => {
        const s = globalStats[code];
        if (!s || (s.count === 0 && s.errors === 0)) return 'bg-[var(--key-bg)] opacity-20';

        const avgLat = s.count > 0 ? s.totalLat / s.count : 0;
        const errorRate = s.count > 0 ? s.errors / (s.count + s.errors) : 1;

        // 熱度演算法 (0-1)
        const heat = Math.min((avgLat / 1000) * 0.7 + errorRate * 2.0, 1);

        if (heat > 0.8) return 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]';
        if (heat > 0.6) return 'bg-orange-500';
        if (heat > 0.4) return 'bg-yellow-500';
        if (heat > 0.2) return 'bg-green-400';
        return 'bg-green-600';
    };

    const rows = [0, 1, 2, 3];

    return (
        <div className="flex flex-col gap-1.5 p-6 bg-[var(--keyboard-bg)] rounded-2xl border border-[var(--text-secondary)]/10">
            <h3 className="text-center text-sm font-bold opacity-50 mb-4 uppercase tracking-widest">
                全域肌肉記憶熱點圖 (累積 {history.length} 場訓練)
            </h3>

            {rows.map((rowNum) => (
                <div key={rowNum} className="flex justify-center gap-1.5">
                    {KEYBOARD_LAYOUT.filter(k => k.row === rowNum && !k.isModifier).map((k) => {
                        const s = globalStats[k.code];
                        const avgLat = s && s.count > 0 ? Math.round(s.totalLat / s.count) : null;
                        const errorCount = s?.errors || 0;
                        const attempts = s?.count || 0;

                        return (
                            <motion.div
                                key={k.code}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs font-bold relative transition-colors ${getKeyHeatColor(k.code)}`}
                            >
                                <span className="text-white text-[11px] drop-shadow-sm">
                                    {gameMode === 'English' ? k.keyEn.toUpperCase() : (k.keyZh || k.keyEn.toUpperCase())}
                                </span>

                                {/* 懸浮 Tooltip 效果 (CSS Based for Simplicity) */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--bg-primary)] text-[var(--text-primary)] p-2 rounded shadow-2xl border border-[var(--text-secondary)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 text-[10px]">
                                    <div>平均延遲: {avgLat ? `${avgLat}ms` : 'N/A'}</div>
                                    <div>正確次數: {attempts}</div>
                                    <div>錯誤次數: {errorCount}</div>
                                </div>

                                {/* 簡單的按鍵內數值 */}
                                {avgLat && (
                                    <span className="text-[8px] text-white/80 font-normal">{avgLat}ms</span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            ))}

            <div className="flex justify-center gap-6 mt-6 text-[10px] opacity-60">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>反應極快 / 零失誤</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded shadow-[0_0_5px_rgba(220,38,38,0.5)]"></div>
                    <span>魔王鍵 (反應慢/高錯誤)</span>
                </div>
            </div>
        </div>
    );
};
