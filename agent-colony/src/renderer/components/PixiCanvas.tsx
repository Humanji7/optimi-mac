/**
 * PixiCanvas Component
 *
 * Purpose: React-компонент для PixiJS canvas
 * Responsibilities:
 * - Инициализация PixiJS Application
 * - Управление lifecycle (mount/unmount)
 * - Обработка resize событий
 * - Управление AgentLayer с агентами
 */

import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { createPixiApp, destroyPixiApp } from '../pixi/setup';
import { loadSprites } from '../pixi/sprites/SpriteLoader';
import { AgentLayer } from '../pixi/AgentLayer';

interface PixiCanvasProps {
  onAppReady?: (app: Application) => void;
  onAgentClick?: (id: string) => void;
}

export function PixiCanvas({ onAppReady, onAgentClick }: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const agentLayerRef = useRef<AgentLayer | null>(null);
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

        // Создаём AgentLayer
        const agentLayer = new AgentLayer();
        agentLayer.attachTicker(app.ticker);
        app.stage.addChild(agentLayer);
        agentLayerRef.current = agentLayer;

        // Устанавливаем callback для кликов по агентам
        if (onAgentClick) {
          agentLayer.onAgentClick = onAgentClick;
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

      if (agentLayerRef.current) {
        console.log('[PixiCanvas] Destroying AgentLayer');
        agentLayerRef.current.destroy();
        agentLayerRef.current = null;
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

      // Генерируем случайную позицию на canvas
      const padding = 100;
      const x = padding + Math.random() * (appRef.current.screen.width - padding * 2);
      const y = padding + Math.random() * (appRef.current.screen.height - padding * 2);

      try {
        const sprite = agentLayerRef.current.addAgent({
          id: agentData.id,
          role: agentData.role as 'Architect' | 'Coder' | 'Tester' | 'Reviewer',
          position: { x, y },
        });

        sprite.setStatus('idle');

        console.log('[PixiCanvas] Agent sprite added to canvas:', {
          id: agentData.id,
          role: agentData.role,
          position: { x, y },
        });
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

  // Обработка resize
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current) {
        console.log('[PixiCanvas] Window resized', {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
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
