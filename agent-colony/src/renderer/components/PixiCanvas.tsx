/**
 * PixiCanvas Component
 *
 * Purpose: React-компонент для PixiJS canvas
 * Responsibilities:
 * - Инициализация PixiJS Application
 * - Управление lifecycle (mount/unmount)
 * - Обработка resize событий
 */

import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { createPixiApp, destroyPixiApp } from '../pixi/setup';

interface PixiCanvasProps {
  onAppReady?: (app: Application) => void;
}

export function PixiCanvas({ onAppReady }: PixiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas element not found');
      return;
    }

    let mounted = true;

    // Инициализация PixiJS
    createPixiApp(canvas)
      .then((app) => {
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

        onAppReady?.(app);
      })
      .catch((err) => {
        console.error('[PixiCanvas] Failed to initialize PixiJS:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize PixiJS');
        }
      });

    // Cleanup
    return () => {
      mounted = false;
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
