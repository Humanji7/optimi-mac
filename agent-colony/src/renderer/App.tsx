/**
 * Main React Component
 *
 * Purpose: Главный компонент приложения с PixiJS canvas для Agent Colony
 */

import { useState, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PixiCanvas } from './components/PixiCanvas';
import { SpawnModal } from './components/SpawnModal';
import { DetailPanel, type Agent } from './components/DetailPanel';
import { TerminalTooltip } from './components/TerminalTooltip';
import { HudOverlay } from './components/HudOverlay';
import { Minimap } from './components/Minimap';
import { ActivityTimeline } from './components/ActivityTimeline';
import { AgentLayer } from './pixi/AgentLayer';
import type { Application } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';
import type { AgentRole } from './pixi/types';

function App() {
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  // _agents используется через setAgents с functional update для доступа к актуальному состоянию
  const [_agents, setAgents] = useState<Map<string, Agent>>(new Map());
  const [hoveredAgent, setHoveredAgent] = useState<{ id: string; x: number; y: number } | null>(null);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [agentLayer, setAgentLayer] = useState<AgentLayer | null>(null);

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

  const handleAgentHover = useCallback((id: string | null, position?: { x: number; y: number }) => {
    if (id && position) {
      setHoveredAgent({ id, x: position.x, y: position.y });
    } else {
      setHoveredAgent(null);
    }
  }, []);

  const handleViewportReady = useCallback((vp: Viewport) => {
    setViewport(vp);
  }, []);

  const handleAgentLayerReady = useCallback((layer: AgentLayer) => {
    setAgentLayer(layer);
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

  const handlePauseAll = async () => {
    console.log('[App] Pausing all agents...');

    try {
      const result = await window.electronAPI.pauseAll();
      console.log('[App] Pause result:', result);

      if (result.errors.length > 0) {
        console.warn('[App] Some agents failed to pause:', result.errors);
      }
    } catch (error) {
      console.error('[App] Failed to pause agents:', error);
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

      const update = data as Partial<Agent> & { id: string };

      // Мёржим с существующими данными
      setAgents((prev) => {
        const newMap = new Map(prev);
        const existing = prev.get(update.id);
        const merged = existing ? { ...existing, ...update } : (update as Agent);
        newMap.set(update.id, merged);

        // Обновить selected agent если он был изменён
        if (selectedAgent?.id === update.id) {
          setSelectedAgent(merged);
        }

        return newMap;
      });
    };

    const unsubscribe = window.electronAPI.onAgentUpdated(handleAgentUpdated);
    return () => unsubscribe();
  }, [selectedAgent]);

  // Hotkeys для быстрого доступа к агентам
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорировать если фокус в input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // ESC — закрыть панель
      if (e.key === 'Escape') {
        setSelectedAgent(null);
        return;
      }

      // Space — pause all agents
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll
        handlePauseAll();
        return;
      }

      // 1-9 — выбрать агента по индексу
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;

        setAgents((currentAgents) => {
          const agentList = Array.from(currentAgents.values());

          if (index < agentList.length) {
            setSelectedAgent(agentList[index]);
            console.log(`[App] Hotkey ${e.key}: selected agent`, agentList[index].id);
          } else {
            console.log(`[App] Hotkey ${e.key}: no agent at index ${index}`);
          }

          return currentAgents;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Пустой массив dependencies так как используем functional update

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Agent Colony</h1>
        <HudOverlay agents={_agents} />
        <div style={styles.headerButtons}>
          <button
            onClick={handlePauseAll}
            style={styles.pauseButton}
            title="Pause all agents (Space)"
          >
            ⏸ Pause All
          </button>
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
      </div>

      {/* Canvas and Detail Panel with resizable divider */}
      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={selectedAgent ? 75 : 100} minSize={30}>
          <div style={styles.canvasContainer}>
            <PixiCanvas
              onAppReady={handleAppReady}
              onAgentClick={handleAgentClick}
              onAgentHover={handleAgentHover}
              onViewportReady={handleViewportReady}
              onAgentLayerReady={handleAgentLayerReady}
            />

            {/* Minimap */}
            {viewport && agentLayer && (
              <Minimap
                agents={Array.from(_agents.keys()).map(id => {
                  const sprite = agentLayer.getAgent(id);
                  return {
                    id,
                    x: sprite?.x ?? 512,
                    y: sprite?.y ?? 512,
                    status: _agents.get(id)?.status ?? 'idle',
                  };
                })}
                viewport={viewport}
              />
            )}

            {/* Activity Timeline */}
            <ActivityTimeline />
          </div>
        </Panel>

        {selectedAgent && (
          <>
            <PanelResizeHandle style={styles.resizeHandle} />
            <Panel defaultSize={25} minSize={15} maxSize={50}>
              <DetailPanel
                agent={selectedAgent}
                onClose={handleClosePanel}
                onKill={handleKillAgent}
                onSendCommand={handleSendCommand}
              />
            </Panel>
          </>
        )}
      </PanelGroup>

      {/* Terminal Tooltip */}
      {hoveredAgent && (
        <TerminalTooltip
          agentId={hoveredAgent.id}
          x={hoveredAgent.x}
          y={hoveredAgent.y}
        />
      )}

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
    zIndex: 1000,
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #444444',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  pauseButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
    pointerEvents: 'auto' as const,
  },
  canvasContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  resizeHandle: {
    width: '4px',
    backgroundColor: '#374151',
    cursor: 'col-resize',
    transition: 'background-color 0.2s',
  },
};

export default App;
