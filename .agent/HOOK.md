# HOOK: Agent Colony V3 — Phase A: UX Fixes

**Status:** 🔴 ACTIVE
**Created:** 2026-01-21
**Type:** Feature Implementation Convoy
**Plan:** See V3_PLAN.md for full roadmap

---

## 📋 Current Convoy: Phase A (UX Fixes)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M1 | Pan карты | Два пальца трекпад | ⚪ PENDING |
| M2 | Zoom | Pinch gesture | ⚪ PENDING |
| M3 | Resizable sidebar | Drag для изменения ширины | ⚪ PENDING |
| M4 | Hotkeys 1-9 | Быстрый доступ к агентам | ⚪ PENDING |
| M5 | Emergency Pause All | Space bar = pause all agents | ⚪ PENDING |

---

## 🎯 CURRENT: M1 — Pan карты

**Goal:** Реализовать перемещение карты двумя пальцами по трекпаду

**Implementation:**
- [ ] Найти текущий viewport/camera код в PixiJS
- [ ] Добавить event listener для wheel (trackpad pan = wheel с deltaX/deltaY)
- [ ] Обновлять позицию viewport при pan gesture
- [ ] Ограничить границы карты (нельзя уйти за пределы)
- [ ] Тест: два пальца двигают карту плавно

---

## 📝 Notes

- Pan на macOS trackpad = `wheel` event с `deltaX` и `deltaY`
- Zoom (pinch) = `wheel` event с `ctrlKey: true` + `deltaY`
- Можно реализовать M1 и M2 вместе, так как они используют один event

---

## 🔗 Context

**Предыдущие фазы:**
- Phase 1 (Core Infrastructure) ✅
- Phase 2 (Visual Layer) ✅
- Phase 3 (Testing & Polish) ✅
- V2 "Living Colony" ✅

**Текущая задача:** V3 Phase A — UX Fixes
