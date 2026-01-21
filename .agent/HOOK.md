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
| M7 | Terminal preview on hover | Последние N строк при наведении | 🔴 IN PROGRESS |
| M8 | HUD + resource meter | Общая статистика + tokens/rate limits | ⚪ PENDING |
| M9 | Minimap | Кликабельный, агенты как цветные точки | ⚪ PENDING |
| M10 | Activity timeline | Лента событий за последние 15 минут | ⚪ PENDING |
| M11 | Error severity levels | blocker/warning/info classification | ⚪ PENDING |

---

## ✅ COMPLETED: M6 — Agent Status Badge

**Commit:** 5d6e6d2
**Changes:**
- AnimatedAgent.ts: добавлен Text badge над спрайтом
- Цвета: idle=серый, working=зелёный, error=красный, paused=жёлтый
- Обновление в setStatus()

---

## 🔴 CURRENT: M7 — Terminal Preview on Hover

**Goal:** Показывать последние 10 строк терминала при наведении на агента

**Implementation Plan:**

### Backend (Main Process)
1. `tmux/capture.ts` — функция capturePane(sessionName, lines)
2. `main/index.ts` — IPC handler `terminal:capture`
3. `preload.ts` — API terminalCapture(agentId, lines)

### Frontend (Renderer)
4. `TerminalTooltip.tsx` — новый компонент
5. `AnimatedAgent.ts` — onHover callback + pointerover/pointerout events
6. `AgentLayer.ts` — onAgentHover callback
7. `PixiCanvas.tsx` — onAgentHover prop, world→screen coords conversion
8. `App.tsx` — state + handler для hover, render TerminalTooltip

---

## 📝 Notes

- Phase A полностью завершена (M1-M5)
- M6 = простая молекула (1 файл)
- Используем PixiJS Text API

---

## 🔗 Context

**Previous phases:**
- Phase A (UX Fixes) ✅ — commits: faa090b, e2f7289, 3818f86, 796ae26, 837d485
