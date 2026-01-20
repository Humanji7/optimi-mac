/**
 * Agent Layer
 *
 * Purpose: Управление всеми агентами на canvas
 * Responsibilities:
 * - Добавление/удаление агентов
 * - Позиционирование агентов
 * - Обновление статусов
 * - Обновление анимаций через ticker
 */

import { Container, Ticker } from 'pixi.js';
import { AgentSprite } from './sprites/AgentSprite';
import { getTexture, type AgentRole } from './sprites/SpriteLoader';
import type { AgentStatus } from './animations/states';

interface AgentData {
  id: string;
  role: AgentRole;
  position: { x: number; y: number };
}

export class AgentLayer extends Container {
  private agents = new Map<string, AgentSprite>();
  private ticker: Ticker | null = null;

  constructor() {
    super();

    console.log('[AgentLayer] Layer created');
  }

  /**
   * Привязывает layer к ticker для анимаций
   *
   * @param ticker - PixiJS Ticker
   */
  attachTicker(ticker: Ticker): void {
    if (this.ticker) {
      console.warn('[AgentLayer] Ticker already attached');
      return;
    }

    this.ticker = ticker;
    this.ticker.add(this.update, this);

    console.log('[AgentLayer] Ticker attached');
  }

  /**
   * Отвязывает ticker
   */
  detachTicker(): void {
    if (this.ticker) {
      this.ticker.remove(this.update, this);
      this.ticker = null;
    }
  }

  /**
   * Добавляет нового агента
   *
   * @param data - Данные агента (id, роль, позиция)
   * @returns Созданный sprite агента
   * @throws {Error} Если агент с таким id уже существует
   */
  addAgent(data: AgentData): AgentSprite {
    if (this.agents.has(data.id)) {
      throw new Error(`Agent with id "${data.id}" already exists`);
    }

    // Получаем текстуру для роли
    const texture = getTexture(data.role);

    // Создаём sprite
    const sprite = new AgentSprite(data.role, texture);
    sprite.position.set(data.position.x, data.position.y);

    // Добавляем в layer
    this.addChild(sprite);
    this.agents.set(data.id, sprite);

    console.log(`[AgentLayer] Agent added: ${data.id} (${data.role}) at (${data.position.x}, ${data.position.y})`);

    return sprite;
  }

  /**
   * Удаляет агента
   *
   * @param id - ID агента
   * @returns true если агент был удалён, false если не найден
   */
  removeAgent(id: string): boolean {
    const sprite = this.agents.get(id);

    if (!sprite) {
      console.warn(`[AgentLayer] Agent not found: ${id}`);
      return false;
    }

    this.removeChild(sprite);
    sprite.destroy();
    this.agents.delete(id);

    console.log(`[AgentLayer] Agent removed: ${id}`);
    return true;
  }

  /**
   * Обновляет статус агента
   *
   * @param id - ID агента
   * @param status - Новый статус
   * @returns true если статус обновлён, false если агент не найден
   */
  updateAgentStatus(id: string, status: AgentStatus): boolean {
    const sprite = this.agents.get(id);

    if (!sprite) {
      console.warn(`[AgentLayer] Cannot update status: agent not found: ${id}`);
      return false;
    }

    sprite.setStatus(status);
    return true;
  }

  /**
   * Получает sprite агента по ID
   *
   * @param id - ID агента
   * @returns Sprite агента или undefined
   */
  getAgent(id: string): AgentSprite | undefined {
    return this.agents.get(id);
  }

  /**
   * Получает всех агентов
   *
   * @returns Map всех агентов
   */
  getAllAgents(): ReadonlyMap<string, AgentSprite> {
    return this.agents;
  }

  /**
   * Получает количество агентов
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Обновление анимаций всех агентов (вызывается ticker'ом)
   */
  private update = (ticker: Ticker): void => {
    const deltaTime = ticker.deltaTime;

    for (const sprite of this.agents.values()) {
      sprite.update(deltaTime);
    }
  };

  /**
   * Очистка всех агентов и ресурсов
   */
  destroy(): void {
    this.detachTicker();

    for (const sprite of this.agents.values()) {
      sprite.destroy();
    }

    this.agents.clear();
    super.destroy({ children: true });

    console.log('[AgentLayer] Layer destroyed');
  }
}
