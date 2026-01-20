/**
 * Main React Component
 *
 * Purpose: Главный компонент приложения с PixiJS canvas для Agent Colony
 */

import { useState } from 'react';
import { PixiCanvas } from './components/PixiCanvas';
import { SpawnModal } from './components/SpawnModal';
import type { Application } from 'pixi.js';
import type { AgentRole } from './pixi/types';

function App() {
  const [showSpawnModal, setShowSpawnModal] = useState(false);

  const handleAppReady = (app: Application) => {
    console.log('[App] PixiJS ready:', {
      width: app.screen.width,
      height: app.screen.height,
    });
  };

  const handleSpawn = async (role: AgentRole, projectPath: string) => {
    console.log('[App] Spawning agent:', { role, projectPath });

    try {
      const result = await window.electronAPI.spawnAgent({
        role,
        projectName: projectPath.split('/').pop() || 'unknown',
        projectPath,
        command: '', // Optional initial command
      });

      console.log('[App] Agent spawned successfully:', result);

      // Close modal on success
      setShowSpawnModal(false);
    } catch (error) {
      console.error('[App] Failed to spawn agent:', error);
      alert(`Failed to spawn agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Agent Colony</h1>
        <button onClick={() => setShowSpawnModal(true)} style={styles.spawnButton}>
          + Spawn Agent
        </button>
      </div>

      {/* Canvas */}
      <PixiCanvas onAppReady={handleAppReady} />

      {/* Spawn Modal */}
      <SpawnModal
        isOpen={showSpawnModal}
        onClose={() => setShowSpawnModal(false)}
        onSpawn={handleSpawn}
      />
    </div>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #444444',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
  },
  spawnButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#007acc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default App;
