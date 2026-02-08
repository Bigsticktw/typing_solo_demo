import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRACTICABLE_KEYS } from '../utils/layoutMaps';

export type GameMode = 'English' | 'Zhuyin';
export type CaseMode = 'lowercase' | 'uppercase' | 'mixed';
export type TimeMode = 15 | 30 | 60 | 120 | 300 | 600 | 'infinite' | number;
export type Theme = 'cyber' | 'paper' | 'retro' | 'neon';
export type HandMode = 'all' | 'left' | 'right';

interface SettingsState {
    gameMode: GameMode;
    caseMode: CaseMode;
    timeMode: TimeMode;
    theme: Theme;
    activeRows: number[];
    handMode: HandMode;
    soundEnabled: boolean;
    volume: number;

    // 新增：單鍵選取
    selectedKeys: string[]; // key codes like 'KeyA', 'KeyB'
    useCustomKeys: boolean; // 是否使用自訂鍵位

    setGameMode: (mode: GameMode) => void;
    setCaseMode: (mode: CaseMode) => void;
    setTimeMode: (time: TimeMode) => void;
    setTheme: (theme: Theme) => void;
    toggleRow: (row: number) => void;
    setHandMode: (mode: HandMode) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setVolume: (val: number) => void;

    // 新增：單鍵選取 actions
    toggleKey: (code: string) => void;
    setSelectedKeys: (codes: string[]) => void;
    selectAllKeys: () => void;
    clearAllKeys: () => void;
    setUseCustomKeys: (use: boolean) => void;
    selectKeysFromString: (str: string) => void;
}

// 從字元取得對應的 key code
const charToKeyCode = (char: string): string | null => {
    const key = PRACTICABLE_KEYS.find(k =>
        k.keyEn.toLowerCase() === char.toLowerCase() || k.keyZh === char
    );
    return key?.code || null;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            gameMode: 'English',
            caseMode: 'mixed',
            timeMode: 60,
            theme: 'cyber',
            activeRows: [2, 3, 4],
            handMode: 'all',
            soundEnabled: true,
            volume: 0.5,
            selectedKeys: [],
            useCustomKeys: false,

            setGameMode: (mode) => set({ gameMode: mode }),
            setCaseMode: (mode) => set({ caseMode: mode }),
            setTimeMode: (time) => set({ timeMode: time }),
            setTheme: (theme) => set({ theme }),

            toggleRow: (row) => set((state) => {
                const isActive = state.activeRows.includes(row);
                let newRows;
                if (isActive) {
                    newRows = state.activeRows.filter(r => r !== row);
                    if (newRows.length === 0) newRows = [row];
                } else {
                    newRows = [...state.activeRows, row].sort();
                }
                // 切換行數時，停用自訂鍵位
                return {
                    activeRows: newRows,
                    useCustomKeys: false,
                    selectedKeys: []
                };
            }),

            setHandMode: (mode) => set({
                handMode: mode,
                // 切換左右手時，停用自訂鍵位
                useCustomKeys: false,
                selectedKeys: []
            }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setVolume: (val) => set({ volume: val }),

            // 單鍵選取
            toggleKey: (code) => set((state) => {
                const isSelected = state.selectedKeys.includes(code);
                let newKeys;
                if (isSelected) {
                    newKeys = state.selectedKeys.filter(k => k !== code);
                } else {
                    newKeys = [...state.selectedKeys, code];
                }
                return {
                    selectedKeys: newKeys,
                    useCustomKeys: newKeys.length > 0
                };
            }),

            setSelectedKeys: (codes) => set({
                selectedKeys: codes,
                useCustomKeys: codes.length > 0
            }),

            selectAllKeys: () => set({
                selectedKeys: PRACTICABLE_KEYS.map(k => k.code),
                useCustomKeys: true
            }),

            clearAllKeys: () => set({
                selectedKeys: [],
                useCustomKeys: false
            }),

            setUseCustomKeys: (use) => set({ useCustomKeys: use }),

            selectKeysFromString: (str) => {
                const chars = [...new Set(str.toLowerCase().split(''))];
                const codes = chars
                    .map(charToKeyCode)
                    .filter((c): c is string => c !== null);

                if (codes.length > 0) {
                    set({ selectedKeys: codes, useCustomKeys: true });
                }
            }
        }),
        {
            name: 'typing-settings-storage',
        }
    )
);
