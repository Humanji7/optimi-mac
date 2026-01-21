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
| M3 | Resizable sidebar | Drag для изменения ширины | ✅ DONE |
| M4 | Hotkeys 1-9 | Быстрый доступ к агентам | 🔴 CURRENT |
| M1+M2 | Pan + Zoom | Два пальца + pinch | ⚪ PENDING |
| M5 | Emergency Pause All | Space bar = pause all agents | ⚪ PENDING |

---

## 🎯 CURRENT: M4 — Hotkeys 1-9

**Goal:** Быстрый доступ к агентам по нажатию клавиш 1-9

**Files:**
- `agent-colony/src/renderer/App.tsx` → useEffect для hotkeys
- `agent-colony/src/renderer/components/PixiCanvas.tsx` → expose agents list

**Implementation:**
- [ ] App.tsx: useEffect с addEventListener('keydown')
- [ ] Hotkeys 1-9 выбирают агента по индексу
- [ ] ESC закрывает DetailPanel
- [ ] Тест: нажатие цифры выбирает агента, ESC закрывает

**See:** PHASE_A_IMPLEMENTATION.md для полного кода

---

## ✅ COMPLETED: M3 — Resizable Sidebar

**Commit:** faa090b
**Changes:**
- Установлен react-resizable-panels@2.1.9
- App.tsx: canvas + panel обернуты в PanelGroup
- DetailPanel: position: relative, width: 100%
- Resize handle: 4px серая полоса с cursor: col-resize
- Min/max: 15-50% для панели, 30%+ для canvas

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
