import { useMemo } from 'react';
import { type GameSession } from '../../store/useGameStore';
import { useSettingsStore, type GameMode } from '../../store/useSettingsStore';
import { KEYBOARD_LAYOUT } from '../../utils/layoutMaps';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    history: GameSession[];
    gameMode?: GameMode; // 可選：用於單一記錄顯示，優先使用此值
}

interface MistakePair {
    target: string;
    pressed: string;
    count: number;
    displayTarget: string;
    displayPressed: string;
}

export const KeyMistakeAnalysis = ({ history, gameMode: propGameMode }: Props) => {
    const { gameMode: currentGameMode, setSelectedKeys } = useSettingsStore();

    // 優先使用傳入的 gameMode，否則使用當前設定
    const displayMode = propGameMode || currentGameMode;

    // 聚合所有錯誤組合
    const topMistakes = useMemo(() => {
        const mistakeMap: Record<string, MistakePair> = {};

        history.forEach(session => {
            // 向後相容:舊資料可能沒有 keyMistakes
            if (!session.keyMistakes) return;

            Object.entries(session.keyMistakes).forEach(([targetCode, pressedKeys]) => {
                if (!pressedKeys) return;

                Object.entries(pressedKeys).forEach(([pressedCode, count]) => {
                    const key = `${targetCode}->${pressedCode}`;

                    // 獲取顯示字元
                    const targetKey = KEYBOARD_LAYOUT.find(k => k.code === targetCode);
                    const pressedKey = KEYBOARD_LAYOUT.find(k => k.code === pressedCode);

                    const displayTarget = displayMode === 'English'
                        ? (targetKey?.keyEn || targetCode)
                        : (targetKey?.keyZh || targetKey?.keyEn || targetCode);

                    const displayPressed = displayMode === 'English'
                        ? (pressedKey?.keyEn || pressedCode)
                        : (pressedKey?.keyZh || pressedKey?.keyEn || pressedCode);

                    if (!mistakeMap[key]) {
                        mistakeMap[key] = {
                            target: targetCode,
                            pressed: pressedCode,
                            count: 0,
                            displayTarget,
                            displayPressed
                        };
                    }
                    mistakeMap[key].count += count;
                });
            });
        });

        // 排序並取前 10 名,排除目標鍵和實際按鍵相同的情況
        return Object.values(mistakeMap)
            .filter(pair => pair.target !== pair.pressed) // 過濾掉自己按成自己的情況
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [history, displayMode]);

    const handlePractice = (mistake: MistakePair) => {
        // 設定特訓這兩個容易搞混的按鍵
        setSelectedKeys([mistake.target, mistake.pressed]);
    };

    if (topMistakes.length === 0) {
        return (
            <div className="bg-[var(--keyboard-bg)] p-8 rounded-2xl border border-[var(--text-secondary)]/10 text-center opacity-30">
                <p className="text-sm">尚無錯誤數據 - 請進行新的訓練以生成錯誤分析!</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--keyboard-bg)] p-6 rounded-2xl border border-[var(--text-secondary)]/10">
            <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={16} />
                最容易按錯的組合 Top 10
            </h3>

            <div className="space-y-2">
                {topMistakes.map((mistake, idx) => {
                    const maxCount = topMistakes[0].count;
                    const percentage = (mistake.count / maxCount) * 100;

                    return (
                        <motion.div
                            key={`${mistake.target}-${mistake.pressed}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative group"
                        >
                            {/* 背景進度條 */}
                            <div className="absolute inset-0 bg-red-500/10 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500/20 to-orange-500/20 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* 內容 */}
                            <div className="relative flex items-center justify-between p-3 rounded-lg">
                                <div className="flex items-center gap-4 font-mono text-sm">
                                    <span className="text-xs opacity-50 w-6">#{idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-[var(--bg-primary)] rounded font-bold text-[var(--accent)]">
                                            {mistake.displayTarget}
                                        </span>
                                        <span className="opacity-50">→</span>
                                        <span className="px-2 py-1 bg-[var(--bg-primary)] rounded font-bold text-red-400">
                                            {mistake.displayPressed}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-red-400">
                                        {mistake.count} 次
                                    </span>
                                    <button
                                        onClick={() => handlePractice(mistake)}
                                        className="px-3 py-1 text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        特訓
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
