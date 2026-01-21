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
| M6 | Agent status badge | Статус над спрайтом (idle/working/error/paused) | ✅ DONE |
| M7 | Terminal preview on hover | Последние N строк при наведении | ✅ DONE |
| M8 | HUD + resource meter | Общая статистика + tokens/rate limits | ✅ DONE |
| M9 | Minimap | Кликабельный, агенты как цветные точки | ✅ DONE |
| M10 | Activity timeline | Лента событий за последние 15 минут | ✅ DONE |
| M11 | Error severity levels | blocker/warning/info classification | ✅ DONE |

---

## ✅ COMPLETED: M6 — Agent Status Badge

**Commit:** 5d6e6d2
**Changes:**
- AnimatedAgent.ts: добавлен Text badge над спрайтом
- Цвета: idle=серый, working=зелёный, error=красный, paused=жёлтый
- Обновление в setStatus()

---

## ✅ COMPLETED: M7 — Terminal Preview on Hover

**Commit:** 3dffb3c
**Changes:**
- Backend: tmux/capture.ts + IPC handler + preload API
- Frontend: TerminalTooltip component + hover events chain
- Координаты: world→screen conversion через viewport.toScreen()
- Tooltip: фиксированная позиция, последние 10 строк терминала

---

## ✅ COMPLETED: M9 — Minimap

**Commit:** c0e6b53
**Changes:**
- Minimap.tsx: Canvas overlay 150x150px в правом нижнем углу
- Агенты как цветные точки (цвет по статусу)
- Viewport rect как белая рамка
- Клик перемещает камеру (viewport.snap)
- PixiCanvas: добавлен callback onAgentLayerReady
- App.tsx: получение позиций агентов из AgentLayer
- Auto-refresh viewport rect каждые 100ms

---

## ✅ COMPLETED: M10 — Activity Timeline

**Commit:** 0184c8a
**Changes:**
- ActivityTimeline.tsx: Event feed component (bottom-left corner)
- In-memory storage: max 50 events, 15-min TTL
- Subscribes to: agent:spawned, agent:killed, agent:updated, agent:error
- Auto-cleanup old events every 30 seconds
- Shows last 10 events with icons (+ × ↻ !), messages, relative time
- Hidden when no events
- App.tsx: Added ActivityTimeline to canvas container
- preload.ts: Verified onAgentError exists (already present)

---

## ✅ COMPLETED: M11 — Error Severity Levels

**Commit:** 345a93a
**Changes:**
- utils/severity.ts: Classification logic (blocker/warning/info)
  * getSeverity(): classifies by health/status
  * classifyErrorMessage(): pattern matching for error text
  * SEVERITY_COLORS/ICONS constants
- DetailPanel.tsx: Severity indicator below metrics
- HudOverlay.tsx: Issues breakdown by severity (replaces health section)
- ActivityTimeline.tsx: Color-coded error events with severity icons

---

## 📝 Notes

- Phase A полностью завершена (M1-M5)
- M6 = простая молекула (1 файл)
- Используем PixiJS Text API

---

## 🔗 Context

**Previous phases:**
- Phase A (UX Fixes) ✅ — commits: faa090b, e2f7289, 3818f86, 796ae26, 837d485
