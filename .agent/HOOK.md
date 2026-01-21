# HOOK: Agent Colony V3 — Phase B: Information Layer

**Status:** ⚪ IDLE (Phase B complete)
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

## ✅ PHASE B COMPLETE!

All Information Layer molecules completed:
- M6: Agent status badge ✅
- M7: Terminal preview on hover ✅
- M8: HUD + resource meter ✅
- M9: Minimap ✅
- M10: Activity timeline ✅
- M11: Error severity levels ✅

**Next:** Phase C (Multi-Agent Control) or archive HOOK.md

---

## 🔄 HANDOFF NOTE (2026-01-21 22:00)

**Что сделано в этой сессии:**

### Phase B завершена (M6-M11):
- M6: Status badge над агентами ✅
- M7: Terminal preview on hover ✅
- M8: HUD overlay в header ✅
- M9: Minimap (правый нижний угол) ✅
- M10: Activity timeline (левый нижний угол) ✅
- M11: Error severity levels ✅

### Багфиксы после Phase B:
- **commit 5226bad**: fix agent status + animation pause (backend)
- **commit ea4d5d0**: fix badge sprite update (frontend)
  - Добавлен вызов updateAgentStatus в PixiCanvas при agent:updated
  - Теперь badge визуально обновляется IDLE ↔ WORKING

**Статус:**
- Backend: updateActivity() меняет idle→working при активности PTY
- Backend: healthCheck каждые 10 сек возвращает working→idle
- Frontend: PixiCanvas теперь вызывает agentLayer.updateAgentStatus()
- Frontend: Анимация паузится при выборе агента (setSelectedAgent)

**Что проверить визуально:**
1. Запустить `pnpm dev`
2. Запустить активность в терминале агента (claude prompt)
3. Убедиться что badge меняется IDLE → WORKING
4. Подождать 10 сек — badge должен вернуться в IDLE
5. Кликнуть на агента — анимация должна остановиться

**Следующие шаги:**
- Phase C: Multi-Agent Control (M12-M15)
- План в V3_PLAN.md

**Resume:** Скажи `Продолжи работу над Agent Colony V3`

---

## 🔗 Context

**Completed phases:**
- Phase A (UX Fixes) ✅ — commits: faa090b, e2f7289, 3818f86, 796ae26, 837d485
- Phase B (Information Layer) ✅ — commits: 5d6e6d2, 3dffb3c, 665a9f1, c0e6b53, 0184c8a, 345a93a
