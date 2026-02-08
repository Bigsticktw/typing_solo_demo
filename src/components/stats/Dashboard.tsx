import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { PerformanceChart } from './PerformanceChart';
import { GlobalHeatmap } from './GlobalHeatmap';
import { KeyMistakeAnalysis } from './KeyMistakeAnalysis';
import { KeystrokeTimeline } from './KeystrokeTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Zap, Target, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { type GameMode } from '../../store/useSettingsStore';

export const Dashboard = () => {
    const { gameHistory, clearHistory } = useGameStore();
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    // 分別過濾英文和注音模式的歷史記錄
    const englishHistory = useMemo(() =>
        gameHistory.filter(session => session.mode === 'English'),
        [gameHistory]
    );

    const zhuyinHistory = useMemo(() =>
        gameHistory.filter(session => session.mode === 'Zhuyin'),
        [gameHistory]
    );

    const totalStats = useMemo(() => {
        const totalScore = gameHistory.reduce((sum, s) => sum + s.score, 0);
        const totalDuration = gameHistory.reduce((sum, s) => sum + s.duration, 0);
        const avgPPM = gameHistory.length > 0
            ? Math.round(gameHistory.reduce((sum, s) => sum + s.ppm, 0) / gameHistory.length)
            : 0;
        const avgAccuracy = gameHistory.length > 0
            ? Math.round(gameHistory.reduce((sum, s) => sum + s.accuracy, 0) / gameHistory.length)
            : 0;

        return { totalScore, totalDuration, avgPPM, avgAccuracy };
    }, [gameHistory]);

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min} 分 ${sec} 秒`;
    };

    if (gameHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-6">
                <div className="p-8 bg-[var(--keyboard-bg)] rounded-full text-[var(--accent)] opacity-20">
                    <Zap size={80} />
                </div>
                <h2 className="text-2xl font-bold opacity-50">尚未有任何練習紀錄</h2>
                <p className="opacity-30">完成一局訓練後，這裡將顯示您的肌肉記憶進步趨勢。</p>
            </div>
        );
    }

    // 渲染單一模式的統計區塊
    const renderModeSection = (mode: GameMode, history: typeof gameHistory, title: string, emoji: string) => {
        if (history.length === 0) return null;

        return (
            <div className="space-y-6 p-6 bg-[var(--bg-primary)]/30 rounded-3xl border border-[var(--text-secondary)]/10">
                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <span>{emoji}</span>
                    <span className="text-[var(--accent)]">{title}</span>
                    <span className="text-xs opacity-30 font-normal">({history.length} 場記錄)</span>
                </h2>

                {/* 熱力圖 */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest pl-2">長期肌肉記憶深層診斷 (熱點圖)</h3>
                    <GlobalHeatmap history={history} />
                </div>

                {/* 錯誤分析 */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest pl-2">錯誤按鍵深度分析</h3>
                    <KeyMistakeAnalysis history={history} gameMode={mode} />
                </div>

                {/* 歷史記錄表格 */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest pl-2">最近訓練清單</h3>
                    <div className="bg-[var(--keyboard-bg)] rounded-2xl overflow-hidden border border-[var(--text-secondary)]/10">
                        <table className="w-full text-left text-sm font-mono">
                            <thead className="bg-[var(--bg-primary)] opacity-70">
                                <tr>
                                    <th className="px-6 py-3">時間</th>
                                    <th className="px-6 py-3">PPM</th>
                                    <th className="px-6 py-3">延遲</th>
                                    <th className="px-6 py-3">正確率</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--text-secondary)]/10">
                                {history.slice(0, 10).map((session) => (
                                    <>
                                        <tr
                                            key={session.id}
                                            className="hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                                            onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                                        >
                                            <td className="px-6 py-4 opacity-60">{new Date(session.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4 font-bold">{session.ppm}</td>
                                            <td className="px-6 py-4 text-purple-400">{session.avgLatency}ms</td>
                                            <td className="px-6 py-4">{session.accuracy}%</td>
                                            <td className="px-6 py-4 text-right">
                                                {expandedSession === session.id ? (
                                                    <ChevronUp size={16} className="opacity-50" />
                                                ) : (
                                                    <ChevronDown size={16} className="opacity-50" />
                                                )}
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedSession === session.id && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <td colSpan={5} className="px-6 py-4 bg-[var(--bg-primary)]">
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-bold opacity-50 uppercase">按鍵時間軸</h4>
                                                            <KeystrokeTimeline
                                                                keystrokeTimings={session.keystrokeTimings}
                                                                startTime={session.timestamp}
                                                                gameMode={session.mode}
                                                            />
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto p-6 space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)]">
                        肌肉記憶數據看板 <span className="text-[var(--accent)]">Dashboard</span>
                    </h2>
                    <p className="text-sm opacity-50 font-mono">持續追蹤您的打字節奏與反應延遲</p>
                </div>

                <button
                    onClick={() => {
                        if (confirm('確定要清除所有歷史紀錄嗎？這項操作無法復原。')) clearHistory();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500/50 hover:text-red-500 opacity-60 hover:opacity-100 transition-all border border-red-500/20 rounded-lg"
                >
                    <Trash2 size={14} /> 清除全部紀錄
                </button>
            </div>

            {/* 核心成就卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: <Trophy />, label: '總正確擊鍵', value: totalStats.totalScore, color: 'text-yellow-400' },
                    { icon: <Clock />, label: '累計訓練時間', value: formatDuration(totalStats.totalDuration), color: 'text-blue-400' },
                    { icon: <Zap />, label: '平均 PPM', value: totalStats.avgPPM, color: 'text-[var(--accent)]' },
                    { icon: <Target />, label: '平均正確率', value: `${totalStats.avgAccuracy}%`, color: 'text-green-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--keyboard-bg)] p-6 rounded-2xl border border-[var(--text-secondary)]/10 shadow-lg">
                        <div className={`p-2 w-fit rounded-lg bg-[var(--bg-primary)] mb-4 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-xs opacity-50 font-bold uppercase mb-1">{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* 進步曲線圖 */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest pl-2">近 30 場表現趨勢</h3>
                <PerformanceChart data={gameHistory} />
            </div>

            {/* 英文模式統計 */}
            {renderModeSection('English', englishHistory, '英文模式統計', '🔤')}

            {/* 注音模式統計 */}
            {renderModeSection('Zhuyin', zhuyinHistory, '注音模式統計', '🈶')}

            <div className="pb-20"></div>
        </motion.div>
    );
};
