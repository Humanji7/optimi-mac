/**
 * TilemapLayer
 *
 * Purpose: Рендер tilemap карты колонии
 * Responsibilities:
 * - Загрузка данных карты
 * - Программная генерация тайлов (Graphics)
 * - Рендер карты как фонового слоя
 */

import { Container, Graphics } from 'pixi.js';
import mapData from '../../assets/maps/base.json';

interface TileType {
  name: string;
  walkable: boolean;
}

interface MapData {
  name: string;
  width: number;
  height: number;
  tileSize: number;
  tiles: number[][];
  tileTypes: Record<string, TileType>;
}

// Цветовая палитра для sci-fi стиля
const TILE_COLORS: Record<string, { fill: number; stroke: number; pattern?: 'grid' | 'dots' | 'lines' }> = {
  floor: { fill: 0x1a1a2e, stroke: 0x252540, pattern: 'grid' },
  floor_edge: { fill: 0x16162a, stroke: 0x2a2a4a, pattern: 'dots' },
  wall: { fill: 0x0a0a14, stroke: 0x1a1a2e },
  station_border: { fill: 0x2a2a4a, stroke: 0x4a4a7a },
  terminal: { fill: 0x1a3a2e, stroke: 0x2a5a4e, pattern: 'lines' },
  hub: { fill: 0x2a2a5a, stroke: 0x4a4a8a, pattern: 'grid' },
};

export class TilemapLayer extends Container {
  private mapData: MapData;
  private tileGraphics: Graphics;

  constructor() {
    super();

    this.mapData = mapData as MapData;
    this.tileGraphics = new Graphics();
    this.addChild(this.tileGraphics);

    this.renderMap();

    console.log(`[TilemapLayer] Map "${this.mapData.name}" loaded: ${this.mapData.width}x${this.mapData.height} tiles`);
  }

  /**
   * Рендерит всю карту
   */
  private renderMap(): void {
    const { width, height, tileSize, tiles, tileTypes } = this.mapData;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = tiles[y][x];
        const tileType = tileTypes[String(tileId)];

        if (tileType) {
          this.renderTile(x, y, tileSize, tileType.name);
        }
      }
    }
  }

  /**
   * Рендерит один тайл
   */
  private renderTile(x: number, y: number, size: number, typeName: string): void {
    const colors = TILE_COLORS[typeName] || TILE_COLORS.floor;
    const px = x * size;
    const py = y * size;

    // Основной фон тайла
    this.tileGraphics.rect(px, py, size, size);
    this.tileGraphics.fill(colors.fill);

    // Рамка тайла
    this.tileGraphics.rect(px, py, size, size);
    this.tileGraphics.stroke({ width: 1, color: colors.stroke, alpha: 0.3 });

    // Паттерн (опционально)
    if (colors.pattern) {
      this.renderPattern(px, py, size, colors.pattern, colors.stroke);
    }
  }

  /**
   * Рендерит паттерн внутри тайла
   */
  private renderPattern(px: number, py: number, size: number, pattern: string, color: number): void {
    const alpha = 0.15;

    switch (pattern) {
      case 'grid':
        // Сетка в центре
        this.tileGraphics.moveTo(px + size / 2, py + 4);
        this.tileGraphics.lineTo(px + size / 2, py + size - 4);
        this.tileGraphics.stroke({ width: 1, color, alpha });

        this.tileGraphics.moveTo(px + 4, py + size / 2);
        this.tileGraphics.lineTo(px + size - 4, py + size / 2);
        this.tileGraphics.stroke({ width: 1, color, alpha });
        break;

      case 'dots':
        // Точки по углам
        const dotSize = 2;
        const offset = 6;
        this.tileGraphics.circle(px + offset, py + offset, dotSize);
        this.tileGraphics.circle(px + size - offset, py + offset, dotSize);
        this.tileGraphics.circle(px + offset, py + size - offset, dotSize);
        this.tileGraphics.circle(px + size - offset, py + size - offset, dotSize);
        this.tileGraphics.fill({ color, alpha });
        break;

      case 'lines':
        // Диагональные линии (терминал)
        for (let i = 0; i < 3; i++) {
          const lineY = py + 8 + i * 8;
          this.tileGraphics.moveTo(px + 4, lineY);
          this.tileGraphics.lineTo(px + size - 4, lineY);
          this.tileGraphics.stroke({ width: 1, color, alpha: 0.3 });
        }
        break;
    }
  }

  /**
   * Получить данные карты
   */
  getMapData(): MapData {
    return this.mapData;
  }

  /**
   * Получить размер карты в пикселях
   */
  getMapSize(): { width: number; height: number } {
    return {
      width: this.mapData.width * this.mapData.tileSize,
      height: this.mapData.height * this.mapData.tileSize,
    };
  }

  /**
   * Проверить, можно ли ходить по тайлу
   */
  isWalkable(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.mapData.width || tileY < 0 || tileY >= this.mapData.height) {
      return false;
    }

    const tileId = this.mapData.tiles[tileY][tileX];
    const tileType = this.mapData.tileTypes[String(tileId)];

    return tileType?.walkable ?? false;
  }

  /**
   * Конвертировать пиксельные координаты в тайловые
   */
  pixelToTile(px: number, py: number): { x: number; y: number } {
    return {
      x: Math.floor(px / this.mapData.tileSize),
      y: Math.floor(py / this.mapData.tileSize),
    };
  }

  /**
   * Конвертировать тайловые координаты в пиксельные (центр тайла)
   */
  tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
    const halfTile = this.mapData.tileSize / 2;
    return {
      x: tileX * this.mapData.tileSize + halfTile,
      y: tileY * this.mapData.tileSize + halfTile,
    };
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    this.tileGraphics.destroy();
    super.destroy({ children: true });

    console.log('[TilemapLayer] Layer destroyed');
  }
}
