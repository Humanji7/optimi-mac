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
import { AnimatedAgent } from './sprites/AnimatedAgent';
import type { AgentRole } from './sprites/SpriteLoader';
import type { AgentStatus } from './animations/states';

interface AgentData {
  id: string;
  role: AgentRole;
  position: { x: number; y: number };
}

export class AgentLayer extends Container {
  private agents = new Map<string, AnimatedAgent>();
  private ticker: Ticker | null = null;
  public onAgentClick?: (id: string) => void; // Callback для клика по агенту
  public onAgentHover?: (id: string | null, position?: { x: number; y: number }) => void;

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
  addAgent(data: AgentData): AnimatedAgent {
    if (this.agents.has(data.id)) {
      throw new Error(`Agent with id "${data.id}" already exists`);
    }

    // Создаём анимированный спрайт (текстура загружается внутри)
    const agent = new AnimatedAgent(data.role);
    agent.position.set(data.position.x, data.position.y);

    // Устанавливаем onClick callback
    agent.onClick = () => {
      if (this.onAgentClick) {
        this.onAgentClick(data.id);
      }
    };

    // Устанавливаем onHover callback
    agent.onHover = (isHovering: boolean) => {
      if (this.onAgentHover) {
        if (isHovering) {
          this.onAgentHover(data.id, { x: agent.x, y: agent.y });
        } else {
          this.onAgentHover(null);
        }
      }
    };

    // Добавляем в layer
    this.addChild(agent);
    this.agents.set(data.id, agent);

    console.log(`[AgentLayer] Agent added: ${data.id} (${data.role}) at (${data.position.x}, ${data.position.y})`);

    return agent;
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
  getAgent(id: string): AnimatedAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Получает всех агентов
   *
   * @returns Map всех агентов
   */
  getAllAgents(): ReadonlyMap<string, AnimatedAgent> {
    return this.agents;
  }

  /**
   * Получает количество агентов
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  private selectedAgentId: string | null = null;

  /**
   * Устанавливает выбранного агента (останавливает его анимацию)
   */
  setSelectedAgent(id: string | null): void {
    // Resume previous
    if (this.selectedAgentId) {
      const prev = this.agents.get(this.selectedAgentId);
      prev?.resumeAnimation();
    }

    // Pause new
    this.selectedAgentId = id;
    if (id) {
      const agent = this.agents.get(id);
      agent?.pauseAnimation();
    }
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
