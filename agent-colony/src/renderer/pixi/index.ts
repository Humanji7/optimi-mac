/**
 * PixiJS Module Exports
 *
 * Purpose: Центральная точка экспорта для всех pixi-модулей
 */

// Setup
export { createPixiApp, destroyPixiApp } from './setup';

// Types
export type { PixiConfig, PixiContextValue, AgentRole, AgentStatus } from './types';

// Sprite Management
export { loadSprites, getTexture, isLoaded, clearCache } from './sprites/SpriteLoader';
export { AgentSprite } from './sprites/AgentSprite';
export { AnimatedAgent } from './sprites/AnimatedAgent';

// Layers
export { AgentLayer } from './AgentLayer';
export { TilemapLayer } from './layers/TilemapLayer';

// Systems
export { MovementSystem } from './systems/Movement';

// Animation States
export { STATUS_COLORS, IDLE_ANIMATION, STATUS_INDICATOR } from './animations/states';
export { getFrameConfig, FRAME_CONFIGS } from './animations/frames';
export type { AnimationState } from './animations/frames';
