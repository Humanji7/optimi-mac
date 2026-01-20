/**
 * Main React Component
 *
 * Purpose: Главный компонент приложения с PixiJS canvas для Agent Colony
 */

import { useState, useEffect, useCallback } from 'react';
import { PixiCanvas } from './components/PixiCanvas';
import { SpawnModal } from './components/SpawnModal';
import { DetailPanel, type Agent } from './components/DetailPanel';
import type { Application } from 'pixi.js';
import type { AgentRole } from './pixi/types';

function App() {
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  // _agents используется через setAgents с functional update для доступа к актуальному состоянию
  const [_agents, setAgents] = useState<Map<string, Agent>>(new Map());

  // useCallback чтобы функция не создавалась заново при каждом рендере
  // Это предотвращает пересоздание PixiJS при открытии модала
  const handleAppReady = useCallback((app: Application) => {
    console.log('[App] PixiJS ready:', {
      width: app.screen.width,
      height: app.screen.height,
    });
  }, []);

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

  // useCallback для стабильной ссылки - не вызывает пересоздание PixiJS
  const handleAgentClick = useCallback((id: string) => {
    console.log('[App] Agent clicked:', id);

    setAgents((currentAgents) => {
      const agent = currentAgents.get(id);
      if (agent) {
        setSelectedAgent(agent);
      } else {
        console.warn('[App] Agent not found in agents map:', id);
      }
      return currentAgents;
    });
  }, []);

  const handleClosePanel = () => {
    setSelectedAgent(null);
  };

  const handleKillAgent = async (id: string) => {
    console.log('[App] Killing agent:', id);

    try {
      await window.electronAPI.killAgent(id);
      console.log('[App] Agent killed successfully:', id);

      // Закрыть панель если убитый агент был выбран
      if (selectedAgent?.id === id) {
        setSelectedAgent(null);
      }

      // Удалить из локального состояния
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      console.error('[App] Failed to kill agent:', error);
      alert(`Failed to kill agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendCommand = async (id: string, command: string) => {
    console.log('[App] Sending command to agent:', { id, command });

    try {
      await window.electronAPI.sendCommand(id, command);
      console.log('[App] Command sent successfully');
    } catch (error) {
      console.error('[App] Failed to send command:', error);
      alert(`Failed to send command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Слушаем события agent:spawned для обновления state
  useEffect(() => {
    const handleAgentSpawned = (agentData: unknown) => {
      console.log('[App] Agent spawned event:', agentData);

      // Парсим данные агента
      const agent = agentData as Agent;

      // Добавляем в локальный state
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.set(agent.id, agent);
        return newMap;
      });
    };

    const unsubscribe = window.electronAPI.onAgentSpawned(handleAgentSpawned);
    return () => unsubscribe(); // Cleanup при unmount
  }, []);

  // Слушаем события agent:killed для обновления state
  useEffect(() => {
    const handleAgentKilled = (data: unknown) => {
      console.log('[App] Agent killed event:', data);

      const { id } = data as { id: string };

      // Удаляем из state
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      // Закрыть панель если убитый агент был выбран
      if (selectedAgent?.id === id) {
        setSelectedAgent(null);
      }
    };

    const unsubscribe = window.electronAPI.onAgentKilled(handleAgentKilled);
    return () => unsubscribe();
  }, [selectedAgent]);

  // Слушаем события agent:updated для обновления state
  useEffect(() => {
    const handleAgentUpdated = (data: unknown) => {
      console.log('[App] Agent updated event:', data);

      const agent = data as Agent;

      // Обновляем в state
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.set(agent.id, agent);
        return newMap;
      });

      // Обновить selected agent если он был изменён
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent(agent);
      }
    };

    const unsubscribe = window.electronAPI.onAgentUpdated(handleAgentUpdated);
    return () => unsubscribe();
  }, [selectedAgent]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Agent Colony</h1>
        <button
          onMouseEnter={() => console.log('[App] Mouse entered button area')}
          onMouseDown={() => console.log('[App] Mouse DOWN on button')}
          onClick={() => {
            console.log('[App] Spawn button clicked!');
            setShowSpawnModal(true);
          }}
          style={styles.spawnButton}
        >
          + Spawn Agent
        </button>
      </div>

      {/* Canvas - с учетом ширины панели если открыта */}
      <div style={selectedAgent ? styles.canvasContainerWithPanel : styles.canvasContainer}>
        <PixiCanvas onAppReady={handleAppReady} onAgentClick={handleAgentClick} />
      </div>

      {/* Detail Panel */}
      <DetailPanel
        agent={selectedAgent}
        onClose={handleClosePanel}
        onKill={handleKillAgent}
        onSendCommand={handleSendCommand}
      />

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
    position: 'relative',
    zIndex: 10,
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
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasContainerWithPanel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    marginRight: '280px', // Ширина панели
  },
};

export default App;
