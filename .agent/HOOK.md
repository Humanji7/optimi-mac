# HOOK: Agent Colony V3 — Phase B: Information Layer

**Status:** 🔴 ACTIVE
**Created:** 2026-01-21
**Type:** Feature Implementation Convoy
**Plan:** V3_PLAN.md

---

## ⚠️ MANDATORY WORKFLOW RULE

> **После завершения КАЖДОЙ молекулы:**
> 1. `git commit` результат
> 2. Запустить Explore агента для СЛЕДУЮЩЕЙ молекулы
> 3. Обновить implementation plan при необходимости
> 4. Только потом — кодить

**Нарушение = потеря контекста = баги = переделка**

---

## 📋 Current Convoy: Phase B (Information Layer)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M6 | Agent status badge | Статус над спрайтом (idle/working/error/paused) | 🔴 IN PROGRESS |
| M7 | Terminal preview on hover | Последние N строк при наведении | ⚪ PENDING |
| M8 | HUD + resource meter | Общая статистика + tokens/rate limits | ⚪ PENDING |
| M9 | Minimap | Кликабельный, агенты как цветные точки | ⚪ PENDING |
| M10 | Activity timeline | Лента событий за последние 15 минут | ⚪ PENDING |
| M11 | Error severity levels | blocker/warning/info classification | ⚪ PENDING |

---

## 🔴 CURRENT: M6 — Agent Status Badge

**Goal:** Показывать статус агента над его спрайтом

**Implementation:**
- Файл: `AnimatedAgent.ts`
- Добавить Text badge в Container
- Позиция: над спрайтом (y = -50)
- Цвета по статусу:
  - idle: серый
  - working: зелёный
  - error: красный
  - paused: жёлтый
- Обновление в методе `setStatus()`

**Files to modify:**
1. `agent-colony/src/renderer/pixi/sprites/AnimatedAgent.ts`

---

## 📝 Notes

- Phase A полностью завершена (M1-M5)
- M6 = простая молекула (1 файл)
- Используем PixiJS Text API

---

## 🔗 Context

**Previous phases:**
- Phase A (UX Fixes) ✅ — commits: faa090b, e2f7289, 3818f86, 796ae26, 837d485
