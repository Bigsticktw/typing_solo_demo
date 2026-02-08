import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getKeyCodeFromChar } from '../utils/charGenerator';
import { KEYBOARD_LAYOUT } from '../utils/layoutMaps';

export const useInputHandler = () => {
    const { status, targetChar, registerInput } = useGameStore();
    const { gameMode } = useSettingsStore();

    const isComposing = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'playing') return;

            // 檢查 CapsLock 並跳過修飾鍵
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Backspace', 'Enter'].includes(e.key)) {
                return;
            }

            if (gameMode === 'English') {
                const inputKey = e.key;
                const pressedKeyCode = e.code;  // 實際按下的 keyCode
                const shiftPressed = e.shiftKey;
                const capsLockOn = e.getModifierState('CapsLock');

                // 獲取目標字符的 keyCode
                const targetKeyCode = getKeyCodeFromChar(targetChar, 'English') || undefined;

                // 檢查是否為字母
                const isLetter = /^[a-zA-Z]$/.test(targetChar);

                let isCorrect = false;

                if (isLetter) {
                    const targetIsUpperCase = targetChar === targetChar.toUpperCase();
                    const baseKey = targetChar.toLowerCase();
                    const inputBaseKey = inputKey.toLowerCase();

                    // 首先檢查按下的實體按鍵是否正確
                    const correctPhysicalKey = inputBaseKey === baseKey;

                    if (correctPhysicalKey) {
                        if (targetIsUpperCase) {
                            // 目標是大寫：需要 (Shift+按鍵) 或 (CapsLock開啟+按鍵且沒按Shift)
                            isCorrect = (shiftPressed && !capsLockOn) || (!shiftPressed && capsLockOn);
                        } else {
                            // 目標是小寫：需要 (沒按Shift且CapsLock關閉) 或 (按Shift且CapsLock開啟)
                            isCorrect = (!shiftPressed && !capsLockOn) || (shiftPressed && capsLockOn);
                        }
                    }
                } else {
                    // 非字母字符，直接比對
                    isCorrect = inputKey === targetChar;
                }

                // targetKeyCode = 目標鍵, pressedKeyCode = 實際按鍵
                registerInput(isCorrect, targetKeyCode, isCorrect ? undefined : pressedKeyCode, isCorrect ? undefined : inputKey);
                e.preventDefault();
            } else if (gameMode === 'Zhuyin') {
                // 注音模式：直接從物理按鍵映射到注音字符
                const key = KEYBOARD_LAYOUT.find(k => k.code === e.code);
                if (key) {
                    let inputChar: string | undefined;

                    // 檢測 Ctrl 組合鍵
                    const isCtrlPressed = e.ctrlKey || e.metaKey;
                    const isShiftPressed = e.shiftKey;

                    if (isCtrlPressed && isShiftPressed && key.keyZhCtrlShift) {
                        // Ctrl+Shift 組合：標點符號（！、？、：）
                        inputChar = key.keyZhCtrlShift;
                    } else if (isCtrlPressed && key.keyZhCtrl) {
                        // Ctrl 組合：標點符號（，、。、；、、、【、】）
                        inputChar = key.keyZhCtrl;
                    } else if (key.keyZh) {
                        // 一般注音符號
                        inputChar = key.keyZh;
                    }

                    if (inputChar) {
                        const isCorrect = inputChar === targetChar;
                        const targetKeyCode = getKeyCodeFromChar(targetChar, gameMode);
                        const pressedKeyCode = e.code;

                        registerInput(isCorrect, targetKeyCode || undefined, isCorrect ? undefined : pressedKeyCode, isCorrect ? undefined : inputChar);
                        e.preventDefault(); // Prevent default only if an input was registered
                    }
                }
            }
        };

        const handleCompositionStart = () => {
            isComposing.current = true;
        };

        const handleCompositionUpdate = () => {
            if (status !== 'playing') return;
            // compositionupdate 只用於檢測,不註冊輸入
            // 避免重複註冊(compositionend 會處理)
        };

        const handleCompositionEnd = () => {
            isComposing.current = false;
            // 注音模式現在使用 keydown 直接檢測，不再需要 composition 事件處理
        };

        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('compositionstart', handleCompositionStart, true);
        window.addEventListener('compositionupdate', handleCompositionUpdate, true);
        window.addEventListener('compositionend', handleCompositionEnd, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('compositionstart', handleCompositionStart, true);
            window.removeEventListener('compositionupdate', handleCompositionUpdate, true);
            window.removeEventListener('compositionend', handleCompositionEnd, true);
        };
    }, [status, targetChar, gameMode, registerInput]);
};
