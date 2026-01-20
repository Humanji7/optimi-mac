# HOOK: Agent Colony Implementation - Phase 2

**Status:** 🔴 ACTIVE
**Created:** 2026-01-20
**Type:** Implementation Convoy
**Project:** Agent Colony - Visual Layer

---

## 📋 Convoy Overview

**Goal:** Визуальный слой для Agent Colony с PixiJS
**Output:** Canvas с агентами-существами, анимации, интерактив
**Phase:** 2 of 4 (Visual Layer)

**Sprites готовы:**
- `src/renderer/assets/sprites/architect.png`
- `src/renderer/assets/sprites/coder.png`
- `src/renderer/assets/sprites/tester.png`
- `src/renderer/assets/sprites/reviewer.png`

---

## 🚀 Molecules

### M5: PixiJS + React Setup ✅ COMPLETE

**Goal:** Интегрировать PixiJS v8 с React

**Tasks:**
- [x] Установить pixi.js v8 + @pixi/react
- [x] Создать PixiCanvas компонент
- [x] Настроить Vite для assets
- [x] Базовый рендер canvas с фоном
- [x] Проверить hot reload работает

**Files:**
```
src/renderer/
├── components/
│   └── PixiCanvas.tsx        # Main canvas component
├── pixi/
│   ├── setup.ts              # PixiJS initialization
│   └── types.ts              # Pixi-related types
└── assets/
    └── sprites/              # Already exists with PNGs
```

**Acceptance:**
- [x] PixiJS рендерит canvas
- [x] React компонент управляет canvas
- [x] Assets загружаются через Vite
- [x] No console errors

**Commit:** `fb9c8da`

---

### M6: Agent Sprites + Animations ✅ COMPLETE

**Goal:** Отображение агентов как существ на canvas

**Tasks:**
- [x] Создать AgentSprite class
- [x] Загрузка спрайтов по роли
- [x] Базовые анимации (idle, working, error)
- [x] Позиционирование агентов
- [x] Status indicator с цветами

**Files:**
```
src/renderer/pixi/
├── sprites/
│   ├── AgentSprite.ts        # Agent sprite class (Container + Sprite + Graphics)
│   └── SpriteLoader.ts       # Asset loading via PixiJS Assets
├── animations/
│   └── states.ts             # Animation states + constants
├── AgentLayer.ts             # Layer управляет всеми агентами
└── index.ts                  # Public exports
```

**Acceptance:**
- [x] Спрайт Architect виден на canvas
- [x] Status indicator под спрайтом
- [x] `pnpm type-check` без ошибок
- [x] `pnpm dev` работает
- [x] Idle анимация (покачивание)

**Commit:** `37f557e`

---

### M7: Spawn Modal UI ⬅️ CURRENT

**Goal:** UI для создания новых агентов

**Tasks:**
- [ ] Модальное окно spawn
- [ ] Выбор роли (4 типа)
- [ ] Ввод project path
- [ ] Кнопка spawn → IPC → main
- [ ] Валидация формы

---

### M8: Detail Panel + Interaction

**Goal:** Панель деталей агента при клике

**Tasks:**
- [ ] Click detection на sprite
- [ ] Side panel с информацией
- [ ] Status, metrics, logs
- [ ] Kill agent button
- [ ] Send command input

---

## 📊 Progress Tracking

| Molecule | Status | Commit | Notes |
|----------|--------|--------|-------|
| M5: PixiJS Setup | ✅ COMPLETE | fb9c8da | Canvas working |
| M6: Agent Sprites | ✅ COMPLETE | 37f557e | Sprites + animations ready |
| M7: Spawn Modal | 🔴 IN PROGRESS | - | Current |
| M8: Detail Panel | ⚪ PENDING | - | - |

**Overall:** 2/4 completed (50%)

---

## 🎯 Phase 2 Success Criteria

- [ ] Агенты отображаются как существа на canvas
- [ ] Клик на агента показывает детали
- [ ] Можно spawn нового агента через UI
- [ ] Анимации отражают статус (idle/working/error)
- [ ] Smooth 60fps рендеринг

---

## 🚨 Smart Delegate Reminder

**Opus планирует, Sonnet кодирует:**
```
Task(model: "sonnet", prompt: "детальный план реализации")
```

---

**Last Updated:** 2026-01-20
**Owner:** Claude Opus 4.5
