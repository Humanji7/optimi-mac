# HOOK: Agent Colony V3 — Phase A: UX Fixes

**Status:** 🔴 ACTIVE
**Created:** 2026-01-21
**Type:** Feature Implementation Convoy
**Plan:** V3_PLAN.md | **Implementation:** PHASE_A_IMPLEMENTATION.md

---

## ⚠️ MANDATORY WORKFLOW RULE

> **После завершения КАЖДОЙ молекулы:**
> 1. `git commit` результат
> 2. Запустить Explore агента для СЛЕДУЮЩЕЙ молекулы
> 3. Обновить implementation plan при необходимости
> 4. Только потом — кодить

**Нарушение = потеря контекста = баги = переделка**

---

## 📋 Current Convoy: Phase A (UX Fixes)

**Порядок реализации (оптимизированный):**

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M3 | Resizable sidebar | Drag для изменения ширины | ⚪ PENDING |
| M4 | Hotkeys 1-9 | Быстрый доступ к агентам | ⚪ PENDING |
| M1+M2 | Pan + Zoom | Два пальца + pinch | ⚪ PENDING |
| M5 | Emergency Pause All | Space bar = pause all agents | ⚪ PENDING |

---

## 🎯 CURRENT: M3 — Resizable Sidebar

**Goal:** Sidebar можно ресайзить drag'ом, терминал читается

**Files:**
- `agent-colony/package.json` → add `react-resizable-panels@^2.1.0`
- `agent-colony/src/renderer/App.tsx` (строки 176-214, 258-263)
- `agent-colony/src/renderer/components/DetailPanel.tsx` (строки 214-217)

**Implementation:**
- [ ] `pnpm add react-resizable-panels@^2.1.0`
- [ ] App.tsx: import { Panel, PanelGroup, PanelResizeHandle }
- [ ] App.tsx: обернуть canvas + panel в PanelGroup
- [ ] DetailPanel.tsx: убрать width: 280px, position: relative
- [ ] Тест: drag resize bar, min/max работает, терминал читается

**See:** PHASE_A_IMPLEMENTATION.md для полного кода

---

## 📝 Notes

- M3 → M4 → M1+M2 → M5 (от простого к сложному)
- M1+M2 объединены (один pixi-viewport пакет)
- M5 требует изменений в main process

---

## 🔗 Context

**Предыдущие фазы:**
- Phase 1 (Core Infrastructure) ✅
- Phase 2 (Visual Layer) ✅
- Phase 3 (Testing & Polish) ✅
- V2 "Living Colony" ✅

**Текущая задача:** V3 Phase A — UX Fixes
