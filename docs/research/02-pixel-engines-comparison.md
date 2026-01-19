# M2: Pixel Game Engines Research

**Date:** 2026-01-19
**Goal:** Выбрать оптимальный engine для визуализации Agent Colony
**Context:** RTS-style визуализация с 20+ анимированными агентами

---

## Executive Summary

**Рекомендация: PixiJS v8**

PixiJS предлагает лучшее сочетание производительности (47 FPS @ 10k sprites), React интеграции (@pixi/react v8), и небольшого bundle size для Agent Colony MVP.

---

## Benchmark Results (10,000 sprites)

| Engine | FPS | WebGL | React Integration | Bundle Size | Status |
|--------|-----|-------|-------------------|-------------|--------|
| **PixiJS v8** | 47 | Yes + WebGPU | @pixi/react v8 (official) | ~150KB gzip | Active |
| **Phaser 3** | 43 | Yes (custom) | Official template | ~300KB gzip | Active |
| Canvas API | ~15-20 | No (2D only) | Native | 0KB | Native |
| Kaboom.js | 3 | Yes | None | ~100KB | **Deprecated** |

*Source: [js-game-rendering-benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark)*

---

## Detailed Analysis

### 1. PixiJS v8

**Pros:**
- Высокая производительность (47 FPS @ 10k sprites)
- WebGL + WebGPU backend (future-proof)
- Официальная React интеграция [@pixi/react v8](https://pixijs.com/blog/pixi-react-v8-live)
- TypeScript из коробки
- Легковесный (~150KB gzip)
- Отличный batching (до 16 текстур)
- Активное развитие (v8.7.0 - Jan 2025)

**Cons:**
- Только рендеринг (нет физики, звука)
- Требует ручного управления game loop

**React Integration:**
```jsx
import { Stage, Sprite, Container } from '@pixi/react';

const AgentColony = () => (
  <Stage width={800} height={600} options={{ background: 0x1a1a2e }}>
    <Container>
      <Sprite image="/agent.png" x={100} y={100} />
    </Container>
  </Stage>
);
```

**Verdict:** Идеален для Agent Colony - только рендеринг нужен, остальное (логика, состояние) в React/TypeScript.

---

### 2. Phaser 3/4

**Pros:**
- Полноценный game framework
- Хорошая производительность (43 FPS @ 10k sprites)
- Встроенная физика, звук, input
- [Официальный React template](https://phaser.io/news/2024/02/official-phaser-3-and-react-template)
- Phaser 4 (TypeScript) в beta (Jan 2025)

**Cons:**
- Больший bundle size (~300KB gzip)
- Избыточен для визуализации (физика, звук не нужны)
- Сложнее интеграция состояния с React
- Своя архитектура сцен конфликтует с React

**React Integration:**
```javascript
// Phaser живёт в своём canvas, React - отдельно
const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scene: [MainScene]
};
```

**Verdict:** Overkill для Agent Colony. Хорош для полноценных игр, но для визуализации агентов избыточен.

---

### 3. Canvas API (Native)

**Pros:**
- Нулевой overhead (native браузер)
- Полный контроль
- Нет зависимостей
- Простота для базовых задач

**Cons:**
- Нет WebGL ускорения (CPU-bound)
- Ручная реализация всего (batching, sprites, animation)
- Низкая производительность при >100 sprites
- Нет готовых абстракций

**Performance:**
```
Canvas 2D: ~15-20 FPS @ 10k sprites
WebGL (PixiJS): ~47 FPS @ 10k sprites
```

**Verdict:** Не подходит для 20+ анимированных агентов. Только для очень простых визуализаций.

---

### 4. Kaboom.js

**Status:** **DEPRECATED** - заменён на [KAPLAY](https://kaplayjs.com/)

**Performance:** 3 FPS @ 10k sprites (критически низкая)

**Verdict:** Не рассматривается. Deprecated + низкая производительность.

---

## Критерии для Agent Colony

| Критерий | Важность | PixiJS | Phaser | Canvas |
|----------|----------|--------|--------|--------|
| FPS @ 20+ sprites | High | 60+ | 60+ | 60 |
| React интеграция | High | Excellent | Good | Manual |
| Bundle size (Electron) | Medium | 150KB | 300KB | 0KB |
| TypeScript support | High | Native | Phaser 4 | Manual |
| Maintainability | High | High | Medium | Low |
| Learning curve | Medium | Low | Medium | Low |

---

## Рекомендация

### Primary: PixiJS v8 + @pixi/react

**Почему:**
1. **Производительность** - 47 FPS даже при 10k sprites, для 20-50 агентов будет стабильные 60 FPS
2. **React native** - декларативный JSX, hooks, состояние в React
3. **Lightweight** - только рендеринг, логика агентов остаётся в TypeScript
4. **Future-proof** - WebGPU backend готов
5. **DX** - TypeScript, hot reload, React DevTools работают

### Alternative: Phaser 3 (если нужна игровая логика)

Рассмотреть если потребуется:
- Встроенная физика
- Система частиц
- Tiled map support
- Audio management

---

## Implementation Notes

### PixiJS + React + Electron Setup

```bash
# Dependencies
pnpm add pixi.js @pixi/react

# Dev setup
pnpm add -D @types/pixi.js
```

### Архитектура для Agent Colony

```
src/
├── components/
│   └── AgentCanvas/
│       ├── AgentCanvas.tsx      # Stage + Container
│       ├── AgentSprite.tsx      # Individual agent
│       ├── StatusOverlay.tsx    # Health bars, context %
│       └── hooks/
│           ├── useAgentAnimation.ts
│           └── useAgentPosition.ts
├── store/
│   └── agentStore.ts            # Zustand state
└── assets/
    └── sprites/
        ├── agents/              # Agent sprites
        └── ui/                  # Status icons
```

### Performance Tips

1. **Texture Atlas** - все спрайты агентов в одном атласе
2. **Object Pooling** - переиспользовать Sprite объекты
3. **Dirty rectangles** - обновлять только изменившиеся области
4. **useTick hook** - для animation loop интеграции

---

## Next Steps

1. Создать PixiJS demo с 20+ анимированными sprites
2. Измерить реальный FPS в Electron
3. Протестировать React state → PixiJS updates
4. Создать базовый AgentSprite компонент

---

## Sources

- [PixiJS v8 Launch](https://pixijs.com/blog/pixi-v8-launches)
- [PixiJS React v8](https://pixijs.com/blog/pixi-react-v8-live)
- [Phaser React Template](https://phaser.io/news/2024/02/official-phaser-3-and-react-template)
- [JS Game Rendering Benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark)
- [PixiJS Performance Tips](https://pixijs.com/8.x/guides/concepts/performance-tips)
- [Phaser Optimization 2025](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)
