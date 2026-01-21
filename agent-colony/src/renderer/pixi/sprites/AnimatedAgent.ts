/**
 * AnimatedAgent
 *
 * Purpose: Анимированный спрайт агента на основе спрайт-шита
 * Responsibilities:
 * - Нарезка спрайт-шита на кадры
 * - Анимация между кадрами по состояниям
 * - Управление состоянием (idle/working/success/fail)
 */

import { Container, Texture, Rectangle, AnimatedSprite, Text, TextStyle, Graphics } from 'pixi.js';
import type { AgentRole } from './SpriteLoader';
import { getTexture } from './SpriteLoader';
import type { AnimationState } from '../animations/frames';
import { getFrameConfig } from '../animations/frames';

/** Размер спрайта на экране */
const DISPLAY_SIZE = 80;

/** Цвета статусов для badge */
const STATUS_COLORS: Record<string, number> = {
  idle: 0x888888,    // серый
  working: 0x22c55e, // зелёный
  error: 0xef4444,   // красный
  paused: 0xeab308,  // жёлтый
};

export class AnimatedAgent extends Container {
  private animatedSprite: AnimatedSprite;
  private frameTextures: Map<AnimationState, Texture[]> = new Map();
  private currentState: AnimationState = 'idle';
  private statusBadge: Container;
  private badgeText: Text;
  private badgeBg: Graphics;
  public readonly role: AgentRole;
  public onClick?: () => void;

  constructor(role: AgentRole) {
    super();

    this.role = role;

    // Получаем конфигурацию и текстуру
    const config = getFrameConfig(role);
    const baseTexture = getTexture(role);

    // Нарезаем текстуру на кадры
    this.extractFrames(baseTexture, config);

    // Создаём AnimatedSprite с idle кадрами
    const idleFrames = this.frameTextures.get('idle') || [baseTexture];
    this.animatedSprite = new AnimatedSprite(idleFrames);
    this.animatedSprite.anchor.set(0.5, 0.5);
    this.animatedSprite.animationSpeed = config.fps / 60; // Convert FPS to speed (60fps base)
    this.animatedSprite.loop = true;
    this.animatedSprite.play();

    // Масштабирование
    const maxDim = Math.max(config.frameWidth, config.frameHeight);
    const scale = DISPLAY_SIZE / maxDim;
    this.animatedSprite.scale.set(scale);

    this.addChild(this.animatedSprite);

    // Status badge
    this.statusBadge = new Container();
    this.statusBadge.position.set(0, -DISPLAY_SIZE / 2 - 16);

    // Badge background
    this.badgeBg = new Graphics();
    this.statusBadge.addChild(this.badgeBg);

    // Badge text
    const textStyle = new TextStyle({
      fontSize: 10,
      fontFamily: 'monospace',
      fill: '#ffffff',
      fontWeight: 'bold',
    });
    this.badgeText = new Text({ text: 'idle', style: textStyle });
    this.badgeText.anchor.set(0.5, 0.5);
    this.statusBadge.addChild(this.badgeText);

    // Initial badge render
    this.updateBadge('idle');

    this.addChild(this.statusBadge);

    // Интерактивность
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointertap', () => {
      this.onClick?.();
    });

    console.log(`[AnimatedAgent] Created ${role} with ${this.getTotalFrameCount()} frames`);
  }

  /**
   * Обновляет визуал badge
   */
  private updateBadge(status: string): void {
    const color = STATUS_COLORS[status] || STATUS_COLORS.idle;

    // Update text
    this.badgeText.text = status.toUpperCase();

    // Redraw background
    const padding = 4;
    const width = this.badgeText.width + padding * 2;
    const height = this.badgeText.height + padding;

    this.badgeBg.clear();
    this.badgeBg.roundRect(-width / 2, -height / 2, width, height, 4);
    this.badgeBg.fill({ color, alpha: 0.9 });
  }

  /**
   * Извлекает кадры из спрайт-шита
   */
  private extractFrames(
    baseTexture: Texture,
    config: { frameWidth: number; frameHeight: number; columns: number; rows: number; states: Record<AnimationState, number[]> }
  ): void {
    const { frameWidth, frameHeight, columns, states } = config;

    // Создаём текстуры для каждого состояния
    for (const [state, indices] of Object.entries(states) as [AnimationState, number[]][]) {
      const textures: Texture[] = [];

      for (const index of indices) {
        const col = index % columns;
        const row = Math.floor(index / columns);

        const frame = new Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);

        const texture = new Texture({
          source: baseTexture.source,
          frame,
        });

        textures.push(texture);
      }

      this.frameTextures.set(state, textures);
    }
  }

  /**
   * Устанавливает состояние анимации
   */
  setState(state: AnimationState): void {
    if (this.currentState === state) {
      return;
    }

    this.currentState = state;
    const frames = this.frameTextures.get(state);

    if (frames && frames.length > 0) {
      this.animatedSprite.textures = frames;
      this.animatedSprite.gotoAndPlay(0);
    }
  }

  /**
   * Получает текущее состояние
   */
  getState(): AnimationState {
    return this.currentState;
  }

  /**
   * Совместимость со старым API (AgentSprite)
   */
  setStatus(status: 'idle' | 'working' | 'error' | 'paused'): void {
    const stateMap: Record<string, AnimationState> = {
      idle: 'idle',
      working: 'working',
      error: 'fail',
      paused: 'idle',
    };

    this.setState(stateMap[status] || 'idle');
    this.updateBadge(status);
  }

  /**
   * Совместимость со старым API
   */
  getStatus(): 'idle' | 'working' | 'error' | 'paused' {
    const reverseMap: Record<AnimationState, 'idle' | 'working' | 'error' | 'paused'> = {
      idle: 'idle',
      working: 'working',
      success: 'idle',
      fail: 'error',
    };

    return reverseMap[this.currentState];
  }

  /**
   * Для совместимости - анимация управляется AnimatedSprite
   */
  update(_deltaTime: number): void {
    // AnimatedSprite обрабатывает анимацию автоматически через ticker
  }

  /**
   * Общее количество кадров
   */
  private getTotalFrameCount(): number {
    let count = 0;
    for (const textures of this.frameTextures.values()) {
      count += textures.length;
    }
    return count;
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    this.animatedSprite.stop();
    this.animatedSprite.destroy();

    // Очищаем кэш текстур кадров
    for (const textures of this.frameTextures.values()) {
      for (const texture of textures) {
        texture.destroy();
      }
    }
    this.frameTextures.clear();

    super.destroy({ children: true });
  }
}
