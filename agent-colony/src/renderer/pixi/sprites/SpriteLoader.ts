/**
 * Sprite Loader
 *
 * Purpose: Загрузка и управление текстурами спрайтов агентов
 * Dependencies: PixiJS Assets API, Vite asset imports
 */

import { Assets, Texture } from 'pixi.js';

// Импорт спрайтов через Vite
import architectImg from '../../assets/sprites/architect.png';
import coderImg from '../../assets/sprites/coder.png';
import testerImg from '../../assets/sprites/tester.png';
import reviewerImg from '../../assets/sprites/reviewer.png';

export type AgentRole = 'Architect' | 'Coder' | 'Tester' | 'Reviewer';

/**
 * Маппинг ролей на пути к спрайтам
 */
const SPRITE_MAP: Record<AgentRole, string> = {
  Architect: architectImg,
  Coder: coderImg,
  Tester: testerImg,
  Reviewer: reviewerImg,
};

/**
 * Маппинг ролей на загруженные текстуры
 */
const textureCache = new Map<AgentRole, Texture>();

/**
 * Загружает все текстуры спрайтов
 *
 * @throws {Error} Если загрузка не удалась
 */
export async function loadSprites(): Promise<void> {
  console.log('[SpriteLoader] Loading agent sprites...');

  try {
    // Добавляем все спрайты в Assets
    const entries = Object.entries(SPRITE_MAP).map(([role, path]) => ({
      alias: role,
      src: path,
    }));

    await Assets.load(entries.map((e) => e.src));

    // Кешируем текстуры
    for (const { alias, src } of entries) {
      const texture = await Assets.load(src);
      textureCache.set(alias as AgentRole, texture);
    }

    console.log('[SpriteLoader] All sprites loaded successfully', {
      count: textureCache.size,
      roles: Array.from(textureCache.keys()),
    });
  } catch (error) {
    console.error('[SpriteLoader] Failed to load sprites:', error);
    throw new Error(`Failed to load agent sprites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Получает текстуру для указанной роли
 *
 * @param role - Роль агента
 * @returns Текстура спрайта
 * @throws {Error} Если текстура не загружена
 */
export function getTexture(role: AgentRole): Texture {
  const texture = textureCache.get(role);

  if (!texture) {
    throw new Error(`Texture for role "${role}" not loaded. Call loadSprites() first.`);
  }

  return texture;
}

/**
 * Проверяет, загружены ли все текстуры
 */
export function isLoaded(): boolean {
  return textureCache.size === Object.keys(SPRITE_MAP).length;
}

/**
 * Очищает кеш текстур
 */
export function clearCache(): void {
  textureCache.clear();
  console.log('[SpriteLoader] Texture cache cleared');
}
