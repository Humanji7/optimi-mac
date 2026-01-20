/**
 * Agent Sprite
 *
 * Purpose: Визуальное представление одного агента
 * Responsibilities:
 * - Отображение спрайта агента
 * - Статус-индикатор (цветной круг)
 * - Простая idle анимация (покачивание)
 * - Управление состоянием (idle/working/error/paused)
 */

import { Container, Sprite, Graphics, Texture } from 'pixi.js';
import type { AgentStatus } from '../animations/states';
import { STATUS_COLORS, IDLE_ANIMATION, STATUS_INDICATOR } from '../animations/states';
import type { AgentRole } from './SpriteLoader';

/**
 * Размер спрайта после масштабирования (в пикселях)
 * Оригинальные спрайты очень большие (1.5-3.6MB, высокое разрешение),
 * поэтому масштабируем их до разумного размера
 */
const SPRITE_SIZE = 120;

export class AgentSprite extends Container {
  private sprite: Sprite;
  private statusIndicator: Graphics;
  private currentStatus: AgentStatus = 'idle';
  private animationTime = 0;
  private isAnimating = false;
  public readonly role: AgentRole;

  /**
   * @param role - Роль агента
   * @param texture - Предзагруженная текстура спрайта
   */
  constructor(role: AgentRole, texture: Texture) {
    super();

    this.role = role;

    // Создаём спрайт
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5, 0.5); // Центр спрайта

    // Масштабируем до разумного размера
    const scale = SPRITE_SIZE / Math.max(this.sprite.width, this.sprite.height);
    this.sprite.scale.set(scale);

    // Создаём статус-индикатор (круг снизу)
    this.statusIndicator = new Graphics();
    this.updateStatusIndicator();
    this.statusIndicator.position.set(0, STATUS_INDICATOR.offsetY);

    // Добавляем в контейнер
    this.addChild(this.sprite);
    this.addChild(this.statusIndicator);

    // Включаем интерактивность
    this.eventMode = 'static';
    this.cursor = 'pointer';

    console.log(`[AgentSprite] Created sprite for ${role}`, {
      originalSize: { width: texture.width, height: texture.height },
      scaledSize: { width: this.sprite.width, height: this.sprite.height },
      scale,
    });
  }

  /**
   * Устанавливает статус агента и обновляет визуал
   */
  setStatus(status: AgentStatus): void {
    if (this.currentStatus === status) {
      return;
    }

    this.currentStatus = status;
    this.updateStatusIndicator();

    console.log(`[AgentSprite] Status changed to ${status} for ${this.role}`);

    // Запускаем/останавливаем анимацию в зависимости от статуса
    if (status === 'idle') {
      this.startIdleAnimation();
    } else {
      this.stopAnimation();
    }
  }

  /**
   * Получает текущий статус агента
   */
  getStatus(): AgentStatus {
    return this.currentStatus;
  }

  /**
   * Обновляет цвет статус-индикатора
   */
  private updateStatusIndicator(): void {
    const color = STATUS_COLORS[this.currentStatus];

    this.statusIndicator.clear();
    this.statusIndicator.circle(0, 0, STATUS_INDICATOR.radius);
    this.statusIndicator.fill({ color, alpha: 0.9 });
  }

  /**
   * Запускает idle анимацию (покачивание)
   */
  startIdleAnimation(): void {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.animationTime = 0;
  }

  /**
   * Останавливает анимацию
   */
  stopAnimation(): void {
    this.isAnimating = false;
    this.sprite.position.set(0, 0); // Возвращаем в исходное положение
  }

  /**
   * Обновление анимации (вызывается каждый кадр через ticker)
   *
   * @param deltaTime - Время с последнего кадра
   */
  update(deltaTime: number): void {
    if (!this.isAnimating) {
      return;
    }

    // Простое синусоидальное покачивание
    this.animationTime += IDLE_ANIMATION.speed * deltaTime;
    const offsetY = Math.sin(this.animationTime) * IDLE_ANIMATION.amplitude;
    this.sprite.position.y = offsetY;
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    this.stopAnimation();
    super.destroy({ children: true });
  }
}
