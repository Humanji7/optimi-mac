/**
 * PixiJS Types
 *
 * Purpose: Типы и интерфейсы для работы с PixiJS
 */

import { Application } from 'pixi.js';

export interface PixiConfig {
  backgroundColor: number;
  antialias: boolean;
  autoDensity: boolean;
  resolution: number;
}

export interface PixiContextValue {
  app: Application | null;
}
