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

### M6: Agent Sprites + Animations ⬅️ CURRENT

**Goal:** Отображение агентов как существ на canvas

**Tasks:**
- [ ] Создать AgentSprite class
- [ ] Загрузка спрайтов по роли
- [ ] Базовые анимации (idle, working, error)
- [ ] Позиционирование агентов
- [ ] Интеграция с AgentManager events

**Files:**
```
src/renderer/pixi/
├── sprites/
│   ├── AgentSprite.ts        # Agent sprite class
│   └── SpriteLoader.ts       # Asset loading
├── animations/
│   └── states.ts             # Animation states
└── AgentLayer.tsx            # React component for agents
```

---

### M7: Spawn Modal UI

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
| M6: Agent Sprites | 🔴 IN PROGRESS | - | Current |
| M7: Spawn Modal | ⚪ PENDING | - | - |
| M8: Detail Panel | ⚪ PENDING | - | - |

**Overall:** 1/4 completed (25%)

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
