import type { GameConfig } from '../types.js';

// 英文字符集
const ENGLISH_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const ENGLISH_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 注音符號（簡化版，可根據需求擴展）
const ZHUYIN_CHARS = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ';

/**
 * 根據遊戲設定生成字符序列
 * @param config 遊戲設定
 * @param count 字符數量
 */
export function generateCharSequence(config: GameConfig, count: number = 100): string[] {
    const chars: string[] = [];

    if (config.mode === 'English') {
        let charSet = '';

        switch (config.caseMode) {
            case 'lowercase':
                charSet = ENGLISH_LOWERCASE;
                break;
            case 'uppercase':
                charSet = ENGLISH_UPPERCASE;
                break;
            case 'mixed':
                charSet = ENGLISH_LOWERCASE + ENGLISH_UPPERCASE;
                break;
        }

        for (let i = 0; i < count; i++) {
            chars.push(charSet[Math.floor(Math.random() * charSet.length)]);
        }
    } else if (config.mode === 'Zhuyin') {
        for (let i = 0; i < count; i++) {
            chars.push(ZHUYIN_CHARS[Math.floor(Math.random() * ZHUYIN_CHARS.length)]);
        }
    }

    return chars;
}
