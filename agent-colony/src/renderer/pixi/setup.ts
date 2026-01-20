/**
 * PixiJS Setup
 *
 * Purpose: Инициализация и конфигурация PixiJS Application
 */

import { Application } from 'pixi.js';
import type { PixiConfig } from './types';

const DEFAULT_CONFIG: PixiConfig = {
  backgroundColor: 0x1a1a2e, // Тёмный фон
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio || 1,
};

/**
 * Создаёт и конфигурирует PixiJS Application
 * @param canvas - HTML canvas element
 * @param container - Parent container for resizeTo (optional)
 * @param config - PixiJS config overrides
 */
export async function createPixiApp(
  canvas: HTMLCanvasElement,
  container?: HTMLElement,
  config: Partial<PixiConfig> = {}
): Promise<Application> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const app = new Application();

  await app.init({
    canvas,
    background: finalConfig.backgroundColor,
    antialias: finalConfig.antialias,
    autoDensity: finalConfig.autoDensity,
    resolution: finalConfig.resolution,
    // resizeTo контейнер, а не window (иначе перекрывает header)
    resizeTo: container,
    // Force WebGL to avoid WebGPU shader issues
    preference: 'webgl',
  });

  return app;
}

/**
 * Cleanup PixiJS Application
 */
export function destroyPixiApp(app: Application): void {
  app.destroy(true, { children: true, texture: true, textureSource: true });
}
