/**
 * Frame Configuration
 *
 * Purpose: Конфигурация кадров для каждого спрайт-шита
 * Responsibilities:
 * - Определение размеров и сетки кадров
 * - Маппинг состояний на кадры анимации
 */

import type { AgentRole } from '../sprites/SpriteLoader';

export type AnimationState = 'idle' | 'working' | 'success' | 'fail';

interface FrameConfig {
  /** Ширина одного кадра в пикселях */
  frameWidth: number;
  /** Высота одного кадра в пикселях */
  frameHeight: number;
  /** Количество столбцов в сетке */
  columns: number;
  /** Количество строк в сетке */
  rows: number;
  /** Маппинг состояний на индексы кадров */
  states: Record<AnimationState, number[]>;
  /** Скорость анимации (кадров в секунду) */
  fps: number;
}

/**
 * Конфигурация кадров для каждой роли
 *
 * Все спрайт-шиты: 2816x1536
 *
 * Architect (4x3 = 12 frames, 704x512 each):
 * - Row 0: Looking through telescope (idle) - frames 0-3
 * - Row 1: UFO platforms only - frames 4-7
 * - Row 2: Pointing/directing (working) - frames 8-11
 *
 * Coder (2x2 = 4 frames, 1408x768 each):
 * - Frame 0-1: Working at keyboard (top row)
 * - Frame 2-3: Different poses (bottom row)
 *
 * Tester (4x1 = 4 frames, 704x1536 each):
 * - Frame 0: Idle on rocket
 * - Frame 1: Testing with checkmarks (success)
 * - Frame 2: Explosion/crash (fail)
 * - Frame 3: Standing with X (fail variant)
 *
 * Reviewer (4x1 = 4 frames, 704x1536 each):
 * - Frame 0: Angry with papers (working)
 * - Frame 1: Banging gavel (working)
 * - Frame 2: Sleeping/exhausted (idle)
 * - Frame 3: Calm sitting (idle)
 */
export const FRAME_CONFIGS: Record<AgentRole, FrameConfig> = {
  Architect: {
    frameWidth: 704,
    frameHeight: 512,
    columns: 4,
    rows: 3,
    states: {
      idle: [0, 1, 2, 3], // Row 0: telescope looking
      working: [8, 9, 10, 11], // Row 2: pointing
      success: [0, 1], // Telescope (done reviewing)
      fail: [8, 9], // Pointing (showing error)
    },
    fps: 4,
  },
  Coder: {
    frameWidth: 1408,
    frameHeight: 768,
    columns: 2,
    rows: 2,
    states: {
      idle: [2, 3], // Bottom row: relaxed poses
      working: [0, 1], // Top row: coding
      success: [0], // Happy coding
      fail: [2], // Frustrated pose
    },
    fps: 3,
  },
  Tester: {
    frameWidth: 704,
    frameHeight: 1536,
    columns: 4,
    rows: 1,
    states: {
      idle: [0], // On rocket
      working: [0, 1], // Rocket + checkmarks
      success: [1], // Checkmarks
      fail: [2, 3], // Explosion + X
    },
    fps: 2,
  },
  Reviewer: {
    frameWidth: 704,
    frameHeight: 1536,
    columns: 4,
    rows: 1,
    states: {
      idle: [2, 3], // Sleeping/calm
      working: [0, 1], // Angry + gavel
      success: [3], // Calm (approved)
      fail: [0], // Angry (rejected)
    },
    fps: 3,
  },
};

/**
 * Получить конфигурацию кадров для роли
 */
export function getFrameConfig(role: AgentRole): FrameConfig {
  return FRAME_CONFIGS[role];
}
