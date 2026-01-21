/**
 * PixiCanvas Component
 *
 * Purpose: React-компонент для PixiJS canvas
 * Responsibilities:
 * - Инициализация PixiJS Application
 * - Управление lifecycle (mount/unmount)
 * - Обработка resize событий
 * - Управление TilemapLayer (фон) и AgentLayer (агенты)
 */

import { useEffect, useRef, useState } from 'react';
import { Application, Ticker } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { createPixiApp, destroyPixiApp } from '../pixi/setup';
import { loadSprites } from '../pixi/sprites/SpriteLoader';
import { AgentLayer } from '../pixi/AgentLayer';
import { TilemapLayer } from '../pixi/layers/TilemapLayer';
import { BuildingsLayer } from '../pixi/layers/BuildingsLayer';
import { MovementSystem } from '../pixi/systems/Movement';

interface PixiCanvasProps {
  onAppReady?: (app: Application) => void;
  onAgentClick?: (id: string) => void;
  onAgentHover?: (id: string | null, screenPos?: { x: number; y: number }) => void;
}

export function PixiCanvas({ onAppReady, onAgentClick, onAgentHover }: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const tilemapLayerRef = useRef<TilemapLayer | null>(null);
  const buildingsLayerRef = useRef<BuildingsLayer | null>(null);
  const agentLayerRef = useRef<AgentLayer | null>(null);
  const movementSystemRef = useRef<MovementSystem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      setError('Canvas or container element not found');
      return;
    }

    let mounted = true;

    // Инициализация PixiJS и загрузка спрайтов
    const initializePixi = async () => {
      try {
        // Создаём PixiJS app с привязкой к контейнеру (не window!)
        const app = await createPixiApp(canvas, container);

        if (!mounted) {
          destroyPixiApp(app);
          return;
        }

        appRef.current = app;
        console.log('[PixiCanvas] PixiJS Application initialized', {
          width: app.screen.width,
          height: app.screen.height,
          resolution: app.renderer.resolution,
        });

        // Загружаем спрайты
        await loadSprites();
        console.log('[PixiCanvas] Sprites loaded');

        // Создаём TilemapLayer (фоновый слой)
        const tilemapLayer = new TilemapLayer();
        tilemapLayerRef.current = tilemapLayer;
        console.log('[PixiCanvas] TilemapLayer created');

        // Создаём BuildingsLayer (между tilemap и agents)
        const buildingsLayer = new BuildingsLayer();
        buildingsLayerRef.current = buildingsLayer;
        console.log('[PixiCanvas] BuildingsLayer created');

        // Создаём Viewport для pan/zoom
        const mapSize = tilemapLayer.getMapSize();
        const viewport = new Viewport({
          screenWidth: app.screen.width,
          screenHeight: app.screen.height,
          worldWidth: mapSize.width,
          worldHeight: mapSize.height,
          events: app.renderer.events,
        });

        // Включаем drag (левая кнопка мыши), pinch-zoom и wheel-zoom
        viewport
          .drag({ mouseButtons: 'left' })
          .pinch()
          .wheel({ smooth: 3 })
          .clampZoom({ minScale: 0.5, maxScale: 3 });

        app.stage.addChild(viewport);
        viewportRef.current = viewport;
        console.log('[PixiCanvas] Viewport created', { worldWidth: mapSize.width, worldHeight: mapSize.height });

        // Добавляем слои в viewport (не в app.stage!)
        viewport.addChild(tilemapLayer);
        viewport.addChild(buildingsLayer);

        // Создаём MovementSystem (использует tilemap для pathfinding)
        const movementSystem = new MovementSystem(tilemapLayer);
        movementSystemRef.current = movementSystem;

        // Добавляем update loop для MovementSystem
        const movementUpdate = (ticker: Ticker) => {
          movementSystem.update(ticker.deltaMS);
        };
        app.ticker.add(movementUpdate);
        console.log('[PixiCanvas] MovementSystem created');

        // Создаём AgentLayer (поверх buildings) — добавляем в viewport
        const agentLayer = new AgentLayer();
        agentLayer.attachTicker(app.ticker);
        viewport.addChild(agentLayer);
        agentLayerRef.current = agentLayer;

        // Устанавливаем callback для кликов по агентам
        if (onAgentClick) {
          agentLayer.onAgentClick = onAgentClick;
        }

        // Устанавливаем callback для hover по агентам
        if (onAgentHover) {
          agentLayer.onAgentHover = (id, worldPos) => {
            if (id && worldPos && viewportRef.current) {
              const screenPos = viewportRef.current.toScreen(worldPos.x, worldPos.y);
              onAgentHover(id, { x: screenPos.x, y: screenPos.y });
            } else {
              onAgentHover(null);
            }
          };
        }

        console.log('[PixiCanvas] AgentLayer created and attached');

        onAppReady?.(app);
      } catch (err) {
        console.error('[PixiCanvas] Failed to initialize PixiJS:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize PixiJS');
        }
      }
    };

    initializePixi();

    // Cleanup
    return () => {
      mounted = false;

      if (movementSystemRef.current) {
        console.log('[PixiCanvas] Destroying MovementSystem');
        movementSystemRef.current.destroy();
        movementSystemRef.current = null;
      }

      if (agentLayerRef.current) {
        console.log('[PixiCanvas] Destroying AgentLayer');
        agentLayerRef.current.destroy();
        agentLayerRef.current = null;
      }

      if (buildingsLayerRef.current) {
        console.log('[PixiCanvas] Destroying BuildingsLayer');
        buildingsLayerRef.current.destroy();
        buildingsLayerRef.current = null;
      }

      if (tilemapLayerRef.current) {
        console.log('[PixiCanvas] Destroying TilemapLayer');
        tilemapLayerRef.current.destroy();
        tilemapLayerRef.current = null;
      }

      if (viewportRef.current) {
        console.log('[PixiCanvas] Destroying Viewport');
        viewportRef.current.destroy();
        viewportRef.current = null;
      }

      if (appRef.current) {
        console.log('[PixiCanvas] Destroying PixiJS Application');
        destroyPixiApp(appRef.current);
        appRef.current = null;
      }
    };
  }, [onAppReady]);

  // Слушаем события agent:spawned из main process
  useEffect(() => {
    const handleAgentSpawned = (agent: unknown) => {
      console.log('[PixiCanvas] Agent spawned event received:', agent);

      if (!agentLayerRef.current || !appRef.current) {
        console.warn('[PixiCanvas] AgentLayer or App not ready, skipping agent spawn');
        return;
      }

      // Парсим данные агента (тип может быть разным в зависимости от AgentManager)
      const agentData = agent as { id: string; role: string; projectPath: string };

      // Генерируем позицию на walkable тайлах tilemap
      let x: number, y: number;

      if (tilemapLayerRef.current) {
        // Используем tilemap для позиционирования
        const mapData = tilemapLayerRef.current.getMapData();

        // Ищем случайный walkable тайл (максимум 100 попыток)
        let attempts = 0;
        let tileX: number, tileY: number;

        do {
          tileX = 2 + Math.floor(Math.random() * (mapData.width - 4));
          tileY = 2 + Math.floor(Math.random() * (mapData.height - 4));
          attempts++;
        } while (!tilemapLayerRef.current.isWalkable(tileX, tileY) && attempts < 100);

        // Конвертируем в пиксели (центр тайла)
        const pos = tilemapLayerRef.current.tileToPixel(tileX, tileY);
        x = pos.x;
        y = pos.y;
      } else {
        // Fallback на старую логику
        const padding = 100;
        x = padding + Math.random() * (appRef.current.screen.width - padding * 2);
        y = padding + Math.random() * (appRef.current.screen.height - padding * 2);
      }

      try {
        const agent = agentLayerRef.current.addAgent({
          id: agentData.id,
          role: agentData.role as 'Architect' | 'Coder' | 'Tester' | 'Reviewer',
          position: { x, y },
        });

        agent.setStatus('idle');

        // Регистрируем в системе движения
        if (movementSystemRef.current) {
          movementSystemRef.current.registerAgent(agentData.id, agent);
        }

        console.log('[PixiCanvas] Agent sprite added to canvas:', {
          id: agentData.id,
          role: agentData.role,
          position: { x, y },
        });

        // Добавляем начальный блок около агента
        if (buildingsLayerRef.current) {
          const blockType = agentData.role === 'Tester' ? 'test_block' : 'code_block';
          buildingsLayerRef.current.addBuildingNearAgent(x, y, blockType, agentData.id);
        }
      } catch (err) {
        console.error('[PixiCanvas] Failed to add agent sprite:', err);
      }
    };

    // Подписываемся на событие
    const unsubscribe = window.electronAPI.onAgentSpawned(handleAgentSpawned);
    console.log('[PixiCanvas] Subscribed to agent:spawned events');

    return () => {
      console.log('[PixiCanvas] Unsubscribing from agent:spawned events');
      unsubscribe();
    };
  }, []);

  // Слушаем события agent:killed из main process
  useEffect(() => {
    const handleAgentKilled = (data: unknown) => {
      console.log('[PixiCanvas] Agent killed event received:', data);

      if (!agentLayerRef.current) {
        console.warn('[PixiCanvas] AgentLayer not ready, skipping agent removal');
        return;
      }

      const { id } = data as { id: string };

      // Удаляем из системы движения
      if (movementSystemRef.current) {
        movementSystemRef.current.unregisterAgent(id);
      }

      // Удаляем все блоки этого агента
      if (buildingsLayerRef.current) {
        buildingsLayerRef.current.removeBuildingsByAgent(id);
      }

      const removed = agentLayerRef.current.removeAgent(id);

      if (removed) {
        console.log('[PixiCanvas] Agent sprite removed from canvas:', id);
      }
    };

    const unsubscribe = window.electronAPI.onAgentKilled(handleAgentKilled);
    console.log('[PixiCanvas] Subscribed to agent:killed events');

    return () => {
      console.log('[PixiCanvas] Unsubscribing from agent:killed events');
      unsubscribe();
    };
  }, []);

  // Слушаем события agent:updated для добавления блоков прогресса
  useEffect(() => {
    const handleAgentUpdated = (data: unknown) => {
      const { id, changes } = data as { id: string; changes: { status?: string } };

      if (!buildingsLayerRef.current || !agentLayerRef.current) return;

      const agent = agentLayerRef.current.getAgent(id);
      if (!agent) return;

      // Добавляем блок в зависимости от нового статуса
      if (changes.status === 'working') {
        buildingsLayerRef.current.addBuildingNearAgent(agent.x, agent.y, 'code_block', id);
      } else if (changes.status === 'idle') {
        // При завершении работы добавляем doc_block
        buildingsLayerRef.current.addBuildingNearAgent(agent.x, agent.y, 'doc_block', id);
      }
    };

    const unsubscribe = window.electronAPI.onAgentUpdated(handleAgentUpdated);
    console.log('[PixiCanvas] Subscribed to agent:updated events');

    return () => {
      console.log('[PixiCanvas] Unsubscribing from agent:updated events');
      unsubscribe();
    };
  }, []);

  // Слушаем события agent:error для добавления блоков ошибок
  useEffect(() => {
    const handleAgentError = (data: unknown) => {
      const { id } = data as { id: string };

      if (!buildingsLayerRef.current || !agentLayerRef.current) return;

      const agent = agentLayerRef.current.getAgent(id);
      if (!agent) return;

      // Добавляем красный блок ошибки
      buildingsLayerRef.current.addBuildingNearAgent(agent.x, agent.y, 'error_block', id);
      console.log('[PixiCanvas] Error block added for agent:', id);
    };

    const unsubscribe = window.electronAPI.onAgentError(handleAgentError);
    console.log('[PixiCanvas] Subscribed to agent:error events');

    return () => {
      console.log('[PixiCanvas] Unsubscribing from agent:error events');
      unsubscribe();
    };
  }, []);

  // Обработка resize — обновляем viewport
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !appRef.current || !viewportRef.current) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      // Обновляем размер viewport
      viewportRef.current.resize(newWidth, newHeight);

      console.log('[PixiCanvas] Viewport resized', { width: newWidth, height: newHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div
        style={{
          position: 'relative', // НЕ fixed - чтобы не перекрывать модалы
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          color: '#ff6b6b',
          fontFamily: 'monospace',
          fontSize: '14px',
        }}
      >
        <div>
          <strong>PixiJS Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
        }}
      />
    </div>
  );
}
