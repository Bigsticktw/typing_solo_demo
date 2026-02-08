import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { KEYBOARD_LAYOUT, FINGER_MAP, LEFT_HAND_CODES, type KeyMap } from '../../utils/layoutMaps';
import clsx from 'clsx';

// Finger color classes
const FINGER_COLORS: Record<string, string> = {
    'left-pinky': 'border-l-4 border-l-pink-400',
    'left-ring': 'border-l-4 border-l-purple-400',
    'left-middle': 'border-l-4 border-l-blue-400',
    'left-index': 'border-l-4 border-l-cyan-400',
    'right-index': 'border-r-4 border-r-cyan-400',
    'right-middle': 'border-r-4 border-r-blue-400',
    'right-ring': 'border-r-4 border-r-purple-400',
    'right-pinky': 'border-r-4 border-r-pink-400',
};

// F 和 J 鍵是盲打定位鍵
const HOME_KEYS = ['KeyF', 'KeyJ'];

export const VirtualKeyboard = () => {
    const {
        activeRows, handMode, gameMode,
        selectedKeys, useCustomKeys, toggleKey
    } = useSettingsStore();
    const { targetChar, feedback, status } = useGameStore();

    // 判斷目標字符是否需要 Shift（全域判斷）
    const isShiftMode = (() => {
        if (!targetChar || status !== 'playing') return false;

        // 檢查是否為大寫字母
        if (targetChar.match(/[A-Z]/)) return true;

        // 檢查是否為需要 Shift 的特殊符號
        const shiftChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'];
        return shiftChars.includes(targetChar);
    })();

    const isRowActive = (layoutRow: number) => {
        if (layoutRow === 4) return false;
        return activeRows.includes(layoutRow + 1);
    };


    // 檢測目標字符需要哪些修飾鍵
    const getRequiredModifiers = () => {
        if (status !== 'playing') return { needsShift: false, needsCtrl: false };

        if (gameMode === 'English') {
            // 英文模式：檢查是否需要 Shift
            const targetKey = KEYBOARD_LAYOUT.find(k =>
                k.keyEn.toLowerCase() === targetChar.toLowerCase() ||
                k.keyShift === targetChar
            );

            if (!targetKey) return { needsShift: false, needsCtrl: false };

            // 大寫字母或 Shift 字符需要 Shift
            const needsShift = targetKey.keyShift === targetChar ||
                (targetKey.keyEn !== targetChar && /^[A-Z]$/.test(targetChar));

            return { needsShift, needsCtrl: false };
        } else {
            // 注音模式：檢查是否需要 Ctrl 或 Ctrl+Shift
            const targetKey = KEYBOARD_LAYOUT.find(k =>
                k.keyZh === targetChar ||
                k.keyZhCtrl === targetChar ||
                k.keyZhCtrlShift === targetChar
            );

            if (!targetKey) return { needsShift: false, needsCtrl: false };

            const needsCtrl = targetKey.keyZhCtrl === targetChar || targetKey.keyZhCtrlShift === targetChar;
            const needsShift = targetKey.keyZhCtrlShift === targetChar;

            return { needsShift, needsCtrl };
        }
    };

    const { needsShift, needsCtrl } = getRequiredModifiers();

    const isTarget = (k: KeyMap) => {
        if (status !== 'playing') return false;

        // 修飾鍵高亮
        if (k.isModifier) {
            if (k.code === 'ShiftLeft' || k.code === 'ShiftRight') {
                return needsShift;
            }
            if (k.code === 'ControlLeft' || k.code === 'ControlRight') {
                return needsCtrl;
            }
            return false;
        }

        // 主鍵高亮
        if (gameMode === 'English') {
            return k.keyEn.toLowerCase() === targetChar.toLowerCase() || k.keyShift === targetChar;
        } else {
            return k.keyZh === targetChar || k.keyZhCtrl === targetChar || k.keyZhCtrlShift === targetChar;
        }
    };

    const isKeySelected = (k: KeyMap) => {
        if (useCustomKeys) {
            return selectedKeys.includes(k.code);
        }
        // 如果沒有使用自訂鍵位，則根據行數和左右手判斷
        if (k.isModifier) return false;
        if (!isRowActive(k.row)) return false;
        if (handMode === 'left' && !LEFT_HAND_CODES.includes(k.code)) return false;
        if (handMode === 'right' && LEFT_HAND_CODES.includes(k.code)) return false;
        return true;
    };

    const getKeyClasses = (k: KeyMap) => {
        const finger = FINGER_MAP[k.code];
        const fingerColor = finger && !k.isModifier ? FINGER_COLORS[finger] : '';
        const isSelected = isKeySelected(k);
        const isTargetKey = isTarget(k);

        return clsx(
            "flex flex-col items-center justify-center rounded-lg font-bold transition-all select-none relative",
            "bg-[var(--key-bg)] text-[var(--key-text)] shadow-lg border border-[var(--text-secondary)]/20",
            fingerColor,
            {
                // 選中狀態
                'opacity-100': isSelected && !k.isModifier,
                'ring-2 ring-green-400 ring-inset': isSelected && useCustomKeys && !k.isModifier,

                // 未選中狀態
                'opacity-30': !isSelected && !k.isModifier,
                'opacity-50': k.isModifier,

                // 目標按鍵
                'ring-4 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)] scale-110 z-20 shadow-[0_0_25px_var(--accent)]': isTargetKey,
                'animate-pulse bg-red-600': isTargetKey && feedback === 'wrong',
                'bg-green-500 scale-105': isTargetKey && feedback === 'correct',
            },
            "h-14 md:h-16"
        );
    };

    const getKeyWidth = (k: KeyMap) => {
        const base = 3.5;
        const width = k.width || 1;
        return `${base * width}rem`;
    };

    const handleKeyClick = (e: React.MouseEvent, k: KeyMap) => {
        e.preventDefault();
        e.stopPropagation();

        // 只有非修飾鍵可以被選取
        if (!k.isModifier && status !== 'playing') {
            toggleKey(k.code);
        }
    };

    const rows = [0, 1, 2, 3, 4];

    return (
        <div
            className="flex flex-col gap-1.5 p-4 bg-[var(--keyboard-bg)] rounded-2xl shadow-2xl border border-[var(--key-bg)] mt-6"
            onMouseDown={(e) => e.preventDefault()}
        >
            {rows.map((rowNum) => (
                <div key={rowNum} className="flex justify-center gap-1.5">
                    {KEYBOARD_LAYOUT.filter(k => k.row === rowNum).map((k) => (
                        <motion.div
                            key={k.code}
                            whileTap={{ scale: 0.95 }}
                            className={getKeyClasses(k)}
                            style={{ width: getKeyWidth(k) }}
                            onMouseDown={(e) => handleKeyClick(e, k)}
                        >
                            {(() => {
                                if (k.isModifier) {
                                    return (
                                        <span className="text-[var(--text-primary)] text-sm md:text-base leading-tight">
                                            {k.keyEn}
                                        </span>
                                    );
                                }

                                // 注音模式：只顯示注音符號
                                if (gameMode === 'Zhuyin') {
                                    return (
                                        <span className="text-[var(--text-primary)] text-sm md:text-base leading-tight">
                                            {k.keyZh || k.keyEn}
                                        </span>
                                    );
                                }

                                // 英文模式：根據全域 Shift 模式決定顯示順序
                                const primaryChar = isShiftMode
                                    ? (k.keyShift || k.keyEn.toUpperCase())
                                    : k.keyEn;
                                const secondaryChar = isShiftMode
                                    ? k.keyEn
                                    : (k.keyShift || k.keyEn.toUpperCase());

                                return (
                                    <>
                                        {/* 主要字元 */}
                                        <span className="text-[var(--text-primary)] text-sm md:text-base leading-tight">
                                            {primaryChar}
                                        </span>
                                        {/* 副標籤 */}
                                        <span className="text-[9px] text-[var(--text-secondary)] opacity-50 leading-none">
                                            {secondaryChar}
                                        </span>
                                    </>
                                );
                            })()}

                            {/* 盲人定位點 - F 和 J 鍵 */}
                            {HOME_KEYS.includes(k.code) && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[var(--text-primary)] opacity-60 rounded-full" />
                            )}
                        </motion.div>
                    ))}
                </div>
            ))}

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-3 text-xs opacity-50">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-pink-400 rounded-sm"></span> 小指</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-400 rounded-sm"></span> 無名指</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span> 中指</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-400 rounded-sm"></span> 食指</span>
                {useCustomKeys && (
                    <span className="flex items-center gap-1.5 ml-4">
                        <span className="w-3 h-3 border-2 border-green-400 rounded-sm"></span> 已選取
                    </span>
                )}
            </div>

            {/* 操作提示 */}
            {status !== 'playing' && (
                <div className="text-center text-xs opacity-40 mt-2">
                    點擊按鍵可單獨選取/取消練習範圍
                </div>
            )}
        </div>
    );
};
