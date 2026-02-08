import type { ReactNode } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { theme } = useSettingsStore();

    return (
        <div
            data-theme={theme}
            className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col items-center justify-center p-4"
        >
            <div className="w-full max-w-5xl">
                {children}
            </div>
        </div>
    );
};
