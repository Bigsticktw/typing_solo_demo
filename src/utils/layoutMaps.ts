export type KeyMap = {
    code: string;
    keyEn: string;
    keyZh: string;
    keyShift?: string; // 按下 Shift 時的字符（英文模式）
    keyZhCtrl?: string; // 按下 Ctrl 時的注音符號（注音模式）
    keyZhCtrlShift?: string; // 按下 Ctrl+Shift 時的注音符號（注音模式）
    row: 0 | 1 | 2 | 3 | 4;
    width?: number; // 1 = standard, 1.25, 1.5, 1.75, 2, 2.25, 6.25 for space
    isModifier?: boolean; // Tab, Caps, Shift, Enter, Backspace
};

// Full ANSI 60% Layout with Zhuyin mapping
export const KEYBOARD_LAYOUT: KeyMap[] = [
    // Row 0 (Esc + Numbers + Backspace)
    { code: 'Escape', keyEn: 'Esc', keyZh: '', row: 0, width: 1, isModifier: true },
    { code: 'Digit1', keyEn: '1', keyZh: 'ㄅ', keyShift: '!', keyZhCtrlShift: '！', row: 0 },
    { code: 'Digit2', keyEn: '2', keyZh: 'ㄉ', keyShift: '@', row: 0 },
    { code: 'Digit3', keyEn: '3', keyZh: 'ˇ', keyShift: '#', row: 0 },
    { code: 'Digit4', keyEn: '4', keyZh: 'ˋ', keyShift: '$', row: 0 },
    { code: 'Digit5', keyEn: '5', keyZh: 'ㄓ', keyShift: '%', row: 0 },
    { code: 'Digit6', keyEn: '6', keyZh: 'ˊ', keyShift: '^', row: 0 },
    { code: 'Digit7', keyEn: '7', keyZh: '˙', keyShift: '&', row: 0 },
    { code: 'Digit8', keyEn: '8', keyZh: 'ㄚ', keyShift: '*', row: 0 },
    { code: 'Digit9', keyEn: '9', keyZh: 'ㄞ', keyShift: '(', row: 0 },
    { code: 'Digit0', keyEn: '0', keyZh: 'ㄢ', keyShift: ')', row: 0 },
    { code: 'Minus', keyEn: '-', keyZh: 'ㄦ', keyShift: '_', row: 0 },
    { code: 'Equal', keyEn: '=', keyZh: '', keyShift: '+', row: 0 },
    { code: 'Backspace', keyEn: '←', keyZh: '', row: 0, width: 2, isModifier: true },

    // Row 1 (Tab + QWERTY...)
    { code: 'Tab', keyEn: 'Tab', keyZh: '', row: 1, width: 1.5, isModifier: true },
    { code: 'KeyQ', keyEn: 'q', keyZh: 'ㄆ', row: 1 },
    { code: 'KeyW', keyEn: 'w', keyZh: 'ㄊ', row: 1 },
    { code: 'KeyE', keyEn: 'e', keyZh: 'ㄍ', row: 1 },
    { code: 'KeyR', keyEn: 'r', keyZh: 'ㄐ', row: 1 },
    { code: 'KeyT', keyEn: 't', keyZh: 'ㄔ', row: 1 },
    { code: 'KeyY', keyEn: 'y', keyZh: 'ㄗ', row: 1 },
    { code: 'KeyU', keyEn: 'u', keyZh: 'ㄧ', row: 1 },
    { code: 'KeyI', keyEn: 'i', keyZh: 'ㄛ', row: 1 },
    { code: 'KeyO', keyEn: 'o', keyZh: 'ㄟ', row: 1 },
    { code: 'KeyP', keyEn: 'p', keyZh: 'ㄣ', row: 1 },
    { code: 'BracketLeft', keyEn: '[', keyZh: '', keyShift: '{', keyZhCtrl: '【', row: 1 },
    { code: 'BracketRight', keyEn: ']', keyZh: '', keyShift: '}', keyZhCtrl: '】', row: 1 },
    { code: 'Backslash', keyEn: '\\', keyZh: '', keyShift: '|', row: 1, width: 1.5 },

    // Row 2 (Caps + ASDF...)
    { code: 'CapsLock', keyEn: 'Caps', keyZh: '', row: 2, width: 1.75, isModifier: true },
    { code: 'KeyA', keyEn: 'a', keyZh: 'ㄇ', row: 2 },
    { code: 'KeyS', keyEn: 's', keyZh: 'ㄋ', row: 2 },
    { code: 'KeyD', keyEn: 'd', keyZh: 'ㄎ', row: 2 },
    { code: 'KeyF', keyEn: 'f', keyZh: 'ㄑ', row: 2 },
    { code: 'KeyG', keyEn: 'g', keyZh: 'ㄕ', row: 2 },
    { code: 'KeyH', keyEn: 'h', keyZh: 'ㄘ', row: 2 },
    { code: 'KeyJ', keyEn: 'j', keyZh: 'ㄨ', row: 2 },
    { code: 'KeyK', keyEn: 'k', keyZh: 'ㄜ', row: 2 },
    { code: 'KeyL', keyEn: 'l', keyZh: 'ㄠ', row: 2 },
    { code: 'Semicolon', keyEn: ';', keyZh: '', keyShift: ':', keyZhCtrl: '；', keyZhCtrlShift: '：', row: 2 },
    { code: 'Quote', keyEn: "'", keyZh: '', keyShift: '"', keyZhCtrl: '、', row: 2 },
    { code: 'Enter', keyEn: 'Enter', keyZh: '', row: 2, width: 2.25, isModifier: true },

    // Row 3 (Shift + ZXCV...)
    { code: 'ShiftLeft', keyEn: 'Shift', keyZh: '', row: 3, width: 2.25, isModifier: true },
    { code: 'KeyZ', keyEn: 'z', keyZh: 'ㄈ', row: 3 },
    { code: 'KeyX', keyEn: 'x', keyZh: 'ㄌ', row: 3 },
    { code: 'KeyC', keyEn: 'c', keyZh: 'ㄏ', row: 3 },
    { code: 'KeyV', keyEn: 'v', keyZh: 'ㄒ', row: 3 },
    { code: 'KeyB', keyEn: 'b', keyZh: 'ㄖ', row: 3 },
    { code: 'KeyN', keyEn: 'n', keyZh: 'ㄙ', row: 3 },
    { code: 'KeyM', keyEn: 'm', keyZh: 'ㄩ', row: 3 },
    { code: 'Comma', keyEn: ',', keyZh: 'ㄝ', keyShift: '<', keyZhCtrl: '，', row: 3 },
    { code: 'Period', keyEn: '.', keyZh: 'ㄡ', keyShift: '>', keyZhCtrl: '。', row: 3 },
    { code: 'Slash', keyEn: '/', keyZh: 'ㄥ', keyShift: '?', keyZhCtrlShift: '？', row: 3 },
    { code: 'ShiftRight', keyEn: 'Shift', keyZh: '', row: 3, width: 2.75, isModifier: true },

    // Row 4 (Bottom modifiers + Space)
    { code: 'ControlLeft', keyEn: 'Ctrl', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'MetaLeft', keyEn: 'Win', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'AltLeft', keyEn: 'Alt', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'Space', keyEn: ' ', keyZh: ' ', row: 4, width: 6.25 },
    { code: 'AltRight', keyEn: 'Alt', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'MetaRight', keyEn: 'Menu', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'Fn', keyEn: 'Fn', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'ContextMenu', keyEn: 'Menu', keyZh: '', row: 4, width: 1.25, isModifier: true },
    { code: 'ControlRight', keyEn: 'Ctrl', keyZh: '', row: 4, width: 1.25, isModifier: true },
];

// Helper: Get all practicable keys (non-modifier)
export const PRACTICABLE_KEYS = KEYBOARD_LAYOUT.filter(k => !k.isModifier && k.keyEn.length === 1);

// Zhuyin map for quick lookup
export const ZHUYIN_MAP: Record<string, string> = {};
KEYBOARD_LAYOUT.forEach(k => {
    if (k.keyZh) {
        ZHUYIN_MAP[k.keyEn.toLowerCase()] = k.keyZh;
    }
});

// Hand zones
export const LEFT_HAND_CODES = [
    'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
    'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT',
    'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG',
    'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB'
];

export const RIGHT_HAND_CODES = [
    'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
    'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight',
    'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
    'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'
];

// Finger assignment
export const FINGER_MAP: Record<string, string> = {
    'Digit1': 'left-pinky', 'Digit2': 'left-ring', 'Digit3': 'left-middle', 'Digit4': 'left-index', 'Digit5': 'left-index',
    'Digit6': 'right-index', 'Digit7': 'right-index', 'Digit8': 'right-middle', 'Digit9': 'right-ring', 'Digit0': 'right-pinky',
    'Minus': 'right-pinky', 'Equal': 'right-pinky',
    'KeyQ': 'left-pinky', 'KeyW': 'left-ring', 'KeyE': 'left-middle', 'KeyR': 'left-index', 'KeyT': 'left-index',
    'KeyY': 'right-index', 'KeyU': 'right-index', 'KeyI': 'right-middle', 'KeyO': 'right-ring', 'KeyP': 'right-pinky',
    'BracketLeft': 'right-pinky', 'BracketRight': 'right-pinky',
    'KeyA': 'left-pinky', 'KeyS': 'left-ring', 'KeyD': 'left-middle', 'KeyF': 'left-index', 'KeyG': 'left-index',
    'KeyH': 'right-index', 'KeyJ': 'right-index', 'KeyK': 'right-middle', 'KeyL': 'right-ring',
    'Semicolon': 'right-pinky', 'Quote': 'right-pinky',
    'KeyZ': 'left-pinky', 'KeyX': 'left-ring', 'KeyC': 'left-middle', 'KeyV': 'left-index', 'KeyB': 'left-index',
    'KeyN': 'right-index', 'KeyM': 'right-index', 'Comma': 'right-middle', 'Period': 'right-ring', 'Slash': 'right-pinky',
};
