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
}

export function PixiCanvas({ onAppReady }: PixiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const agentLayerRef = useRef<AgentLayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas element not found');
      return;
    }

    let mounted = true;

    // Инициализация PixiJS и загрузка спрайтов
    const initializePixi = async () => {
      try {
        // Создаём PixiJS app
        const app = await createPixiApp(canvas);

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

        console.log('[PixiCanvas] AgentLayer created and attached');

        // Добавляем тестового агента в центр экрана для проверки
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        const testAgent = agentLayer.addAgent({
          id: 'test-agent-1',
          role: 'Architect',
          position: { x: centerX, y: centerY },
        });

        testAgent.setStatus('idle');

        console.log('[PixiCanvas] Test agent added at center', {
          position: { x: centerX, y: centerY },
        });

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
          position: 'fixed',
          top: 0,
          left: 0,
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
