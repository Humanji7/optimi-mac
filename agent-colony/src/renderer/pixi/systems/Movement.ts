/**
 * Movement System
 *
 * Purpose: Управление движением агентов по карте
 * Responsibilities:
 * - Плавное перемещение к целевой точке (по команде)
 * - Проверка проходимости через TilemapLayer
 *
 * Note: Auto-wander отключён. Используй moveAgentTo() для движения.
 */

import type { TilemapLayer } from '../layers/TilemapLayer';
import type { AnimatedAgent } from '../sprites/AnimatedAgent';

/** Скорость движения (пикселей в секунду) */
const MOVE_SPEED = 64; // 2 тайла/сек при размере тайла 32px

/** Время ожидания в idle (миллисекунды) */
const IDLE_TIME_MIN = 2000;
const IDLE_TIME_MAX = 5000;

/** Радиус блуждания (в тайлах) */
const WANDER_RADIUS = 5;

/** Допустимая погрешность достижения цели */
const ARRIVAL_THRESHOLD = 4;

interface AgentMovementState {
  agent: AnimatedAgent;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  idleUntil: number;
}

export class MovementSystem {
  private tilemap: TilemapLayer;
  private agents: Map<string, AgentMovementState> = new Map();

  constructor(tilemap: TilemapLayer) {
    this.tilemap = tilemap;
    console.log('[MovementSystem] Initialized');
  }

  /**
   * Регистрирует агента в системе движения
   */
  registerAgent(id: string, agent: AnimatedAgent): void {
    if (this.agents.has(id)) {
      return;
    }

    this.agents.set(id, {
      agent,
      targetX: agent.x,
      targetY: agent.y,
      isMoving: false,
      idleUntil: Date.now() + this.randomIdleTime(),
    });

    console.log(`[MovementSystem] Agent registered: ${id}`);
  }

  /**
   * Удаляет агента из системы
   */
  unregisterAgent(id: string): void {
    this.agents.delete(id);
  }

  /**
   * Обновление всех агентов (вызывается каждый кадр)
   * Note: Auto-wander отключён — агенты двигаются только по команде moveAgentTo()
   */
  update(deltaMs: number): void {
    for (const [, state] of this.agents) {
      if (state.isMoving) {
        this.updateMovement(state, deltaMs);
      }
      // Auto-wander disabled — agents stay at spawn position
    }
  }

  /**
   * Обновление движения агента
   */
  private updateMovement(state: AgentMovementState, deltaMs: number): void {
    const { agent, targetX, targetY } = state;

    const dx = targetX - agent.x;
    const dy = targetY - agent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Проверяем достижение цели
    if (distance < ARRIVAL_THRESHOLD) {
      this.arriveAtTarget(state);
      return;
    }

    // Нормализуем направление и вычисляем шаг
    const moveDistance = (MOVE_SPEED * deltaMs) / 1000;
    const ratio = Math.min(moveDistance / distance, 1);

    agent.x += dx * ratio;
    agent.y += dy * ratio;
  }

  /**
   * Агент достиг цели
   */
  private arriveAtTarget(state: AgentMovementState): void {
    state.isMoving = false;
    state.idleUntil = Date.now() + this.randomIdleTime();
    state.agent.setState('idle');
  }

  /**
   * Начинает случайное блуждание
   */
  private startWandering(_id: string, state: AgentMovementState): void {
    const target = this.findRandomWalkableTarget(state.agent.x, state.agent.y);

    if (!target) {
      // Не нашли проходимую точку, подождём ещё
      state.idleUntil = Date.now() + 1000;
      return;
    }

    state.targetX = target.x;
    state.targetY = target.y;
    state.isMoving = true;
    state.agent.setState('working'); // "walking" визуально = working анимация
  }

  /**
   * Ищет случайную проходимую точку в радиусе
   */
  private findRandomWalkableTarget(fromX: number, fromY: number): { x: number; y: number } | null {
    const currentTile = this.tilemap.pixelToTile(fromX, fromY);
    const mapData = this.tilemap.getMapData();

    // Делаем несколько попыток найти проходимую точку
    for (let attempt = 0; attempt < 20; attempt++) {
      const offsetX = Math.floor(Math.random() * (WANDER_RADIUS * 2 + 1)) - WANDER_RADIUS;
      const offsetY = Math.floor(Math.random() * (WANDER_RADIUS * 2 + 1)) - WANDER_RADIUS;

      // Пропускаем текущую позицию
      if (offsetX === 0 && offsetY === 0) continue;

      const targetTileX = currentTile.x + offsetX;
      const targetTileY = currentTile.y + offsetY;

      // Проверяем границы карты
      if (targetTileX < 0 || targetTileX >= mapData.width) continue;
      if (targetTileY < 0 || targetTileY >= mapData.height) continue;

      // Проверяем проходимость
      if (!this.tilemap.isWalkable(targetTileX, targetTileY)) continue;

      // Простая проверка пути (линия видимости)
      if (!this.hasLineOfSight(currentTile, { x: targetTileX, y: targetTileY })) continue;

      return this.tilemap.tileToPixel(targetTileX, targetTileY);
    }

    return null;
  }

  /**
   * Простая проверка прямой видимости между точками
   */
  private hasLineOfSight(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return true;

    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 1; i <= steps; i++) {
      const checkX = Math.round(from.x + stepX * i);
      const checkY = Math.round(from.y + stepY * i);

      if (!this.tilemap.isWalkable(checkX, checkY)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Случайное время ожидания
   */
  private randomIdleTime(): number {
    return IDLE_TIME_MIN + Math.random() * (IDLE_TIME_MAX - IDLE_TIME_MIN);
  }

  /**
   * Принудительно перемещает агента к точке
   */
  moveAgentTo(id: string, x: number, y: number): void {
    const state = this.agents.get(id);
    if (!state) return;

    state.targetX = x;
    state.targetY = y;
    state.isMoving = true;
    state.agent.setState('working');
  }

  /**
   * Останавливает движение агента
   */
  stopAgent(id: string): void {
    const state = this.agents.get(id);
    if (!state) return;

    state.isMoving = false;
    state.idleUntil = Date.now() + this.randomIdleTime();
    state.agent.setState('idle');
  }

  /**
   * Очистка
   */
  destroy(): void {
    this.agents.clear();
    console.log('[MovementSystem] Destroyed');
  }
}
