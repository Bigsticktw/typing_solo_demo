import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EnvironmentGuard = () => {
    const { gameMode } = useSettingsStore();
    const { status } = useGameStore();
    const [showWarning, setShowWarning] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<string>('');

    useEffect(() => {
        // 只在遊戲進行中檢測
        if (status !== 'playing') {
            setShowWarning(false);
            return;
        }

        // 簡單的輸入法檢測邏輯
        // 監聽 compositionstart 事件來檢測 IME 輸入
        const handleCompositionStart = () => {
            // 如果遊戲模式是英文,但檢測到輸入法組字事件,則可能是中文輸入法
            if (gameMode === 'English') {
                setDetectedLanguage('中文輸入法');
                setShowWarning(true);
            }
        };

        const handleCompositionEnd = () => {
            // compositionend 時清除警告(可選)
            // setShowWarning(false);
        };

        // 監聽按鍵來檢測非 ASCII 字符
        const handleKeyPress = (e: KeyboardEvent) => {
            if (status !== 'playing') return;

            // 如果是注音模式但檢測到英文輸入
            if (gameMode === 'Zhuyin' && e.key.match(/^[a-zA-Z]$/)) {
                // 注音模式下英文按鍵是正常的,不需要警告
                return;
            }

            // 如果是英文模式但檢測到中文字符
            if (gameMode === 'English' && !e.key.match(/^[\x00-\x7F]$/)) {
                setDetectedLanguage('非英文輸入');
                setShowWarning(true);
            }
        };

        document.addEventListener('compositionstart', handleCompositionStart);
        document.addEventListener('compositionend', handleCompositionEnd);
        document.addEventListener('keypress', handleKeyPress);

        return () => {
            document.removeEventListener('compositionstart', handleCompositionStart);
            document.removeEventListener('compositionend', handleCompositionEnd);
            document.removeEventListener('keypress', handleKeyPress);
        };
    }, [gameMode, status]);

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] max-w-md"
                >
                    <div className="bg-orange-500/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-orange-400 flex items-start gap-4">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1">輸入法語系衝突警告</h4>
                            <p className="text-xs opacity-90">
                                偵測到 <span className="font-bold">{detectedLanguage}</span>，
                                但目前訓練模式為 <span className="font-bold">{gameMode === 'English' ? '英文' : '注音'}</span>。
                                請切換至正確的輸入法以避免誤判。
                            </p>
                            <p className="text-[10px] opacity-70 mt-2">
                                💡 Windows: Win+Space 切換輸入法
                            </p>
                        </div>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
