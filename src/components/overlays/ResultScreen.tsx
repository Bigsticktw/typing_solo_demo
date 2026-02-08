import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Target } from 'lucide-react';
import { KEYBOARD_LAYOUT } from '../../utils/layoutMaps';
import { useMemo } from 'react';

export const ResultScreen = () => {
    const {
        score, errors, totalKeystrokes, startTime,
        resetGame, restartGame, setTargetChar,
        keyLatencies, keyErrors
    } = useGameStore();

    const { setSelectedKeys, gameMode } = useSettingsStore();

    const accuracy = totalKeystrokes > 0
        ? Math.round((score / totalKeystrokes) * 100)
        : 0;

    // Calculate PPM
    const elapsedMs = Date.now() - startTime;
    const elapsedMinutes = elapsedMs / 60000;
    const ppm = elapsedMinutes > 0 ? Math.round(score / elapsedMinutes) : 0;

    // Calculate average latency
    const avgLatency = useMemo(() => {
        const allLatencies = Object.values(keyLatencies).flat();
        if (allLatencies.length === 0) return 0;
        return Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length);
    }, [keyLatencies]);

    // Find weakest keys (slowest + most errors)
    const weakestKeys = useMemo(() => {
        const keyScores: Record<string, number> = {};

        // Calculate score for each key (higher = worse)
        Object.entries(keyLatencies).forEach(([code, latencies]) => {
            const avgLat = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            keyScores[code] = (keyScores[code] || 0) + avgLat;
        });

        Object.entries(keyErrors).forEach(([code, errorCount]) => {
            keyScores[code] = (keyScores[code] || 0) + errorCount * 500; // 每個錯誤加 500ms 權重
        });

        return Object.entries(keyScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([code]) => code);
    }, [keyLatencies, keyErrors]);

    // Get key stats for heatmap
    const getKeyHeatColor = (code: string) => {
        const latencies = keyLatencies[code] || [];
        const errorCount = keyErrors[code] || 0;

        if (latencies.length === 0 && errorCount === 0) {
            return 'bg-[var(--key-bg)] opacity-30'; // 未使用
        }

        const avgLat = latencies.length > 0
            ? latencies.reduce((a, b) => a + b, 0) / latencies.length
            : 0;

        const totalAttempts = latencies.length + errorCount;
        const errorRate = totalAttempts > 0 ? (errorCount / totalAttempts) * 100 : 0;

        // 嚴格對應左側說明：
        // 🔴 需加強：平均延遲 > 1000ms 或錯誤率 > 20%
        if (avgLat > 1000 || errorRate > 20) return 'bg-red-600';

        // 🟢 優秀：平均延遲 < 500ms，錯誤率 < 5%
        if (avgLat < 500 && errorRate < 5) return 'bg-green-600';

        // 🟡 一般：介於中間 (500-1000ms, 5-20%)
        return 'bg-yellow-500';
    };

    const getKeyStats = (code: string) => {
        const latencies = keyLatencies[code] || [];
        const errorCount = keyErrors[code] || 0;
        const avgLat = latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : null;
        const totalAttempts = latencies.length + errorCount;
        const errorRate = totalAttempts > 0 ? Math.round((errorCount / totalAttempts) * 100) : 0;
        return { avgLat, errorCount, attempts: latencies.length, errorRate };
    };

    const handleRestart = () => {
        restartGame();
        setTargetChar('');
    };

    const handleWeakKeyTraining = () => {
        if (weakestKeys.length > 0) {
            setSelectedKeys(weakestKeys);
            restartGame();
            setTargetChar('');
        }
    };

    const rows = [0, 1, 2, 3];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center justify-center w-full h-full min-h-[500px] gap-6 overflow-auto py-8"
        >
            {/* 左側：獨立的評分標準說明 (絕對定位於整個區域左上角) */}
            <div className="hidden min-[1650px]:flex absolute left-8 top-8 flex-col gap-6 text-sm text-gray-300 min-w-[260px] z-20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🟢</span>
                    <div>
                        <strong className="text-green-400 text-base">優秀</strong>
                        <div className="text-xs text-gray-400 mt-0.5">平均延遲 &lt; 500ms，錯誤率 &lt; 5%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🟡</span>
                    <div>
                        <strong className="text-yellow-400 text-base">一般</strong>
                        <div className="text-xs text-gray-400 mt-0.5">平均延遲 500-1000ms，錯誤率 5-20%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🔴</span>
                    <div>
                        <strong className="text-red-400 text-base">需加強</strong>
                        <div className="text-xs text-gray-400 mt-0.5">平均延遲 &gt; 1000ms 或錯誤率 &gt; 20%</div>
                    </div>
                </div>
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                訓練結束
            </h2>

            {/* 主要統計 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                <div className="flex flex-col gap-2">
                    <div className="text-sm opacity-50">得分</div>
                    <div className="text-4xl font-black text-[var(--accent)]">{score}</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm opacity-50">錯誤</div>
                    <div className="text-4xl font-black text-red-500">{errors}</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm opacity-50">準確率</div>
                    <div className="text-4xl font-black">{accuracy}%</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm opacity-50">PPM</div>
                    <div className="text-4xl font-black text-blue-400">{ppm}</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm opacity-50">平均延遲</div>
                    <div className="text-4xl font-black text-purple-400">{avgLatency}ms</div>
                </div>
            </div>

            {/* 弱點熱點圖 */}
            <div className="relative mt-4 w-full flex flex-col items-center">
                <h3 className="text-center text-sm opacity-50 mb-3">弱點熱點圖</h3>

                <div className="relative flex justify-center items-center w-full max-w-[95vw]">
                    {/* 右側：鍵盤 (保留背景，置中) */}
                    <div className="relative flex flex-col gap-1 p-4 bg-[var(--keyboard-bg)] rounded-xl shadow-2xl mx-auto z-10 transition-all duration-300">

                        {rows.map((rowNum) => (
                            <div key={rowNum} className="flex justify-center gap-2">
                                {KEYBOARD_LAYOUT.filter(k => k.row === rowNum && !k.isModifier).map((k) => {
                                    const stats = getKeyStats(k.code);
                                    const heatColor = getKeyHeatColor(k.code);

                                    return (
                                        <div
                                            key={k.code}
                                            className={`w-20 h-20 flex flex-col items-center justify-center rounded text-xs font-bold relative ${heatColor} transition-all border border-white/5`}
                                            title={stats.avgLat !== null
                                                ? `${gameMode === 'English' ? k.keyEn.toUpperCase() : k.keyZh}: ${stats.avgLat}ms, ${stats.errorCount} 錯誤, 錯誤率 ${stats.errorRate}%`
                                                : '未測試'}
                                        >
                                            <span className="text-white text-[18px] font-bold" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)' }}>
                                                {gameMode === 'English' ? k.keyEn.toUpperCase() : (k.keyZh || k.keyEn.toUpperCase())}
                                            </span>
                                            {stats.avgLat !== null && (
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[15px] text-white font-bold" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)' }}>{stats.avgLat}ms</span>
                                                    <span className="text-[15px] text-white font-black" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)' }}>
                                                        {stats.errorRate}%
                                                    </span>
                                                </div>
                                            )}
                                            {/* 弱點標記 */}
                                            {weakestKeys.includes(k.code) && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* 平板/手機版圖例 (顯示在下方，當螢幕不夠寬時顯示) */}
                    <div className="flex min-[1650px]:hidden flex-wrap justify-center gap-6 mt-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🟢</span>
                            <span className="text-green-400 font-bold">優秀</span>
                            <span className="text-xs opacity-70">(&lt;500ms, &lt;5%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🟡</span>
                            <span className="text-yellow-400 font-bold">一般</span>
                            <span className="text-xs opacity-70">(500-1000ms, 5-20%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔴</span>
                            <span className="text-red-400 font-bold">需加強</span>
                            <span className="text-xs opacity-70">(&gt;1000ms, &gt;20%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--text-secondary)] opacity-60 hover:opacity-100 transition-opacity"
                >
                    <Home size={20} />
                    返回主頁
                </motion.button>

                {weakestKeys.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWeakKeyTraining}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-bold"
                    >
                        <Target size={20} />
                        弱點特訓 ({weakestKeys.length}鍵)
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] font-bold shadow-[0_0_15px_var(--accent)]"
                >
                    <RotateCcw size={20} />
                    再來一次
                </motion.button>
            </div>
        </motion.div>
    );
};
