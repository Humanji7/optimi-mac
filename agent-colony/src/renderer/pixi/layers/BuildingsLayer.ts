/**
 * BuildingsLayer
 *
 * Purpose: Слой для визуализации прогресса (блоки, построенные агентами)
 * Responsibilities:
 * - Отображение блоков прогресса
 * - Управление добавлением/удалением блоков
 * - Анимация появления новых блоков
 */

import { Container, Graphics } from 'pixi.js';

export type BuildingType = 'code_block' | 'test_block' | 'error_block' | 'doc_block';

interface Building {
  id: string;
  x: number;
  y: number;
  type: BuildingType;
  agentId: string;
  graphic: Graphics;
  createdAt: number;
}

// Цвета для разных типов блоков
const BUILDING_COLORS: Record<BuildingType, { fill: number; stroke: number; glow: number }> = {
  code_block: { fill: 0x2563eb, stroke: 0x3b82f6, glow: 0x60a5fa }, // Синий
  test_block: { fill: 0x16a34a, stroke: 0x22c55e, glow: 0x4ade80 }, // Зелёный
  error_block: { fill: 0xdc2626, stroke: 0xef4444, glow: 0xf87171 }, // Красный
  doc_block: { fill: 0x7c3aed, stroke: 0x8b5cf6, glow: 0xa78bfa }, // Фиолетовый
};

const BLOCK_SIZE = 16;
const BLOCK_SPACING = 4;

export class BuildingsLayer extends Container {
  private buildings: Map<string, Building> = new Map();
  private buildingCounter = 0;

  constructor() {
    super();
    console.log('[BuildingsLayer] Layer created');
  }

  /**
   * Добавляет новый блок
   */
  addBuilding(x: number, y: number, type: BuildingType, agentId: string): string {
    const id = `building_${++this.buildingCounter}`;
    const colors = BUILDING_COLORS[type];

    const graphic = new Graphics();

    // Основной блок
    graphic.rect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    graphic.fill(colors.fill);

    // Рамка
    graphic.rect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    graphic.stroke({ width: 1, color: colors.stroke });

    // Позиционирование
    graphic.x = x;
    graphic.y = y;

    // Анимация появления (масштаб)
    graphic.scale.set(0);
    this.animateAppear(graphic);

    this.addChild(graphic);

    const building: Building = {
      id,
      x,
      y,
      type,
      agentId,
      graphic,
      createdAt: Date.now(),
    };

    this.buildings.set(id, building);

    console.log(`[BuildingsLayer] Building added: ${id} (${type}) at (${x}, ${y})`);
    return id;
  }

  /**
   * Добавляет блок рядом с позицией агента
   */
  addBuildingNearAgent(agentX: number, agentY: number, type: BuildingType, agentId: string): string {
    // Находим свободную позицию рядом с агентом
    const offset = this.findFreeOffset(agentX, agentY);
    const x = agentX + offset.x;
    const y = agentY + offset.y;

    return this.addBuilding(x, y, type, agentId);
  }

  /**
   * Ищет свободную позицию для нового блока
   */
  private findFreeOffset(baseX: number, baseY: number): { x: number; y: number } {
    const step = BLOCK_SIZE + BLOCK_SPACING;

    // Спиральный поиск свободной позиции
    const offsets = [
      { x: step, y: 0 },
      { x: step, y: step },
      { x: 0, y: step },
      { x: -step, y: step },
      { x: -step, y: 0 },
      { x: -step, y: -step },
      { x: 0, y: -step },
      { x: step, y: -step },
      // Второй круг
      { x: step * 2, y: 0 },
      { x: step * 2, y: step },
      { x: step * 2, y: step * 2 },
      { x: step, y: step * 2 },
      { x: 0, y: step * 2 },
    ];

    for (const offset of offsets) {
      const testX = baseX + offset.x;
      const testY = baseY + offset.y;

      // Проверяем, нет ли блока в этой позиции
      let occupied = false;
      for (const building of this.buildings.values()) {
        if (Math.abs(building.x - testX) < BLOCK_SIZE && Math.abs(building.y - testY) < BLOCK_SIZE) {
          occupied = true;
          break;
        }
      }

      if (!occupied) {
        return offset;
      }
    }

    // Если все позиции заняты, возвращаем случайную
    return {
      x: (Math.random() - 0.5) * step * 3,
      y: (Math.random() - 0.5) * step * 3,
    };
  }

  /**
   * Анимация появления блока
   */
  private animateAppear(graphic: Graphics): void {
    let scale = 0;
    const targetScale = 1;
    const duration = 200; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: easeOutBack
      const c1 = 1.70158;
      const c3 = c1 + 1;
      scale = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);

      graphic.scale.set(scale * targetScale);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Удаляет блок по ID
   */
  removeBuilding(id: string): boolean {
    const building = this.buildings.get(id);

    if (!building) {
      return false;
    }

    this.removeChild(building.graphic);
    building.graphic.destroy();
    this.buildings.delete(id);

    console.log(`[BuildingsLayer] Building removed: ${id}`);
    return true;
  }

  /**
   * Удаляет все блоки агента
   */
  removeBuildingsByAgent(agentId: string): number {
    let removed = 0;

    for (const [id, building] of this.buildings) {
      if (building.agentId === agentId) {
        this.removeChild(building.graphic);
        building.graphic.destroy();
        this.buildings.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[BuildingsLayer] Removed ${removed} buildings for agent ${agentId}`);
    }

    return removed;
  }

  /**
   * Получить количество блоков
   */
  getBuildingCount(): number {
    return this.buildings.size;
  }

  /**
   * Получить количество блоков по типу
   */
  getBuildingCountByType(): Record<BuildingType, number> {
    const counts: Record<BuildingType, number> = {
      code_block: 0,
      test_block: 0,
      error_block: 0,
      doc_block: 0,
    };

    for (const building of this.buildings.values()) {
      counts[building.type]++;
    }

    return counts;
  }

  /**
   * Очистка
   */
  destroy(): void {
    for (const building of this.buildings.values()) {
      building.graphic.destroy();
    }

    this.buildings.clear();
    super.destroy({ children: true });

    console.log('[BuildingsLayer] Layer destroyed');
  }
}
