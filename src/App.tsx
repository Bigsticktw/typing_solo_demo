import { useState, useEffect } from 'react';
import { GameCanvas } from './components/core/GameCanvas';
import { ResultScreen } from './components/overlays/ResultScreen';
import { SettingsPanel } from './components/overlays/SettingsPanel';
import { Dashboard } from './components/stats/Dashboard';
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby';
import { RoomView } from './components/multiplayer/RoomView';
import { MultiplayerGameCanvas } from './components/multiplayer/MultiplayerGameCanvas';
import { MultiplayerResultScreen } from './components/multiplayer/MultiplayerResultScreen';
import { useGameStore } from './store/useGameStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useMultiplayerStore } from './store/useMultiplayerStore';
import { LayoutDashboard, Keyboard, Users } from 'lucide-react';
import clsx from 'clsx';
import { SoundManager } from './components/core/SoundManager';

function App() {
  const { status } = useGameStore();
  const { theme } = useSettingsStore();
  const { status: multiplayerStatus } = useMultiplayerStore();
  const [activeTab, setActiveTab] = useState<'game' | 'multiplayer' | 'stats'>('game');

  // Set theme attribute on body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // 如果遊戲開始，自動切換回 game 標籤
  useEffect(() => {
    if (status === 'playing') {
      setActiveTab('game');
    }
  }, [status]);

  // 如果多人遊戲開始，自動切換到 multiplayer 標籤
  useEffect(() => {
    if (multiplayerStatus === 'playing') {
      setActiveTab('multiplayer');
    }
  }, [multiplayerStatus]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-inter selection:bg-[var(--accent)] selection:text-[var(--bg-primary)] flex flex-col">
      <SoundManager />

      {/* 導覽列 */}
      <nav className="flex justify-center p-4 gap-4 z-50">
        <div className="flex bg-[var(--keyboard-bg)] rounded-xl p-1.5 shadow-xl border border-[var(--text-secondary)]/10">
          <button
            onClick={() => setActiveTab('game')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'game'
                ? "bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_15px_var(--accent)]"
                : "opacity-50 hover:opacity-100"
            )}
          >
            <Keyboard size={18} />
            訓練模式
          </button>
          <button
            onClick={() => setActiveTab('multiplayer')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'multiplayer'
                ? "bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_15px_var(--accent)]"
                : "opacity-50 hover:opacity-100"
            )}
          >
            <Users size={18} />
            多人對戰
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'stats'
                ? "bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_15px_var(--accent)]"
                : "opacity-50 hover:opacity-100"
            )}
          >
            <LayoutDashboard size={18} />
            數據統計
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col container mx-auto px-4 relative">
        {activeTab === 'game' ? (
          <>
            {status !== 'finished' ? (
              <>
                <GameCanvas />
                <SettingsPanel />
              </>
            ) : (
              <ResultScreen />
            )}
          </>
        ) : activeTab === 'multiplayer' ? (
          <>
            {multiplayerStatus === 'lobby' && <MultiplayerLobby />}
            {multiplayerStatus === 'in-room' && <RoomView />}
            {multiplayerStatus === 'playing' && <MultiplayerGameCanvas />}
            {multiplayerStatus === 'finished' && <MultiplayerResultScreen />}
          </>
        ) : (
          <Dashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs opacity-20 font-mono tracking-widest uppercase">
        Typing Muscle Memory v1.0 • Built for Mastery
      </footer>
    </div>
  );
}

export default App;
