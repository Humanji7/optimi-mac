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

import { Container, Sprite, Texture } from 'pixi.js';
import type { AgentStatus } from '../animations/states';
import { IDLE_ANIMATION } from '../animations/states';
import type { AgentRole } from './SpriteLoader';

/**
 * Размер спрайта после масштабирования (в пикселях)
 * Оригинальные спрайты очень большие (1.5-3.6MB, высокое разрешение),
 * поэтому масштабируем их до разумного размера
 */
const SPRITE_SIZE = 120;

export class AgentSprite extends Container {
  private sprite: Sprite;
  private currentStatus: AgentStatus = 'idle';
  private animationTime = 0;
  private isAnimating = false;
  public readonly role: AgentRole;
  public onClick?: () => void; // Callback для клика

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

    // Добавляем в контейнер
    this.addChild(this.sprite);
    // TODO: Добавить PNG-based статус индикатор вместо Graphics (shader issue)

    // Включаем интерактивность
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Обработка клика
    this.on('pointertap', () => {
      if (this.onClick) {
        this.onClick();
      }
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
