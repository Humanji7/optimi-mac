/**
 * Animation States Configuration
 *
 * Purpose: Константы для статусов агентов и их визуальное представление
 */

export type AgentStatus = 'idle' | 'working' | 'error' | 'paused';

/**
 * Цвета статус-индикатора для каждого состояния
 */
export const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: 0x3b82f6, // blue
  working: 0x22c55e, // green
  error: 0xef4444, // red
  paused: 0x6b7280, // gray
};

/**
 * Параметры idle анимации (покачивание)
 */
export const IDLE_ANIMATION = {
  amplitude: 2, // Амплитуда покачивания в пикселях
  speed: 0.02, // Скорость анимации
};

/**
 * Размеры статус-индикатора
 */
export const STATUS_INDICATOR = {
  radius: 8, // Радиус круга
  offsetY: 40, // Смещение вниз от центра спрайта
};
