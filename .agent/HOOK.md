# HOOK: Agent Colony V3 — Bugfixes

**Status:** ⚪ IDLE (Bugfixes complete)
**Created:** 2026-01-21
**Type:** Bugfix Session
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

## 🔄 HANDOFF NOTE (2026-01-22 00:45)

### 📊 Статус проекта

**Phase B (Information Layer):** ✅ COMPLETE
**Bugfix Session:** ✅ COMPLETE
**Готов к:** Phase C (Multi-Agent Control)

---

### 🔧 Проблемы и Решения (эта сессия)

#### Проблема 1: Terminal Encoding (кириллица отображалась некорректно)

**Симптом:** Буквы в терминале "не попадали", кириллица отображалась неправильно.

**Причина:** В env node-pty не были установлены locale переменные.

**Решение:** Добавлены `LANG=en_US.UTF-8` и `LC_ALL=en_US.UTF-8` в env.
```typescript
// src/main/terminal/pty-manager.ts
env: {
  ...process.env,
  TERM: 'xterm-256color',
  COLORTERM: 'truecolor',
  LANG: 'en_US.UTF-8',      // ← добавлено
  LC_ALL: 'en_US.UTF-8',    // ← добавлено
}
```
**Commit:** `b0d40c1`

---

#### Проблема 2: Activity Detection не работал

**Симптом:** Viewer PTY (терминал в UI) не триггерил статус `working`. Агенты всегда оставались `idle`.

**Причина:** Viewer PTY создаётся через `attachToTmux()` с флагом `isViewer: true` и специально не триггерит activity (чтобы просмотр не влиял на статус).

**Решение:** Activity detection через сравнение содержимого tmux pane в healthCheck.
```typescript
// src/main/agents/manager.ts
private lastPaneContentHash: Map<string, string> = new Map();

// В runHealthCheck():
const paneContent = await tmux.capturePane(agent.process.tmuxSession, 20);
const contentHash = paneContent.join('\n');
const lastHash = this.lastPaneContentHash.get(agent.id);

if (lastHash !== undefined && contentHash !== lastHash) {
  activityDetected = true;  // Контент изменился → агент работает
}
this.lastPaneContentHash.set(agent.id, contentHash);
```
**Commit:** `b0d40c1`

---

#### Проблема 3: Terminal Tooltip показывал верх вместо низа

**Симптом:** При hover на агента tooltip показывал первые строки терминала вместо последних.

**Причина:** `capturePane()` возвращал `stdout.split('\n').slice(0, lines)` — первые N строк.

**Решение:** Изменена логика — убираем trailing empty lines и берём последние N:
```typescript
// src/main/tmux/capture.ts
const allLines = stdout.split('\n').map(line => line.trimEnd());
while (allLines.length > 0 && allLines[allLines.length - 1] === '') {
  allLines.pop();
}
return allLines.slice(-lines);  // ← последние N строк
```
**Commit:** `e5548c6`

---

#### Проблема 4: Агенты случайно блуждали по карте

**Симптом:** Агенты перемещались по карте в idle состоянии. Пользователь хотел чтобы они оставались на месте spawn.

**Причина:** `MovementSystem` имел auto-wander логику — каждые 2-5 секунд агент искал случайную точку и шёл к ней.

**Решение:** Отключён auto-wander, сохранён API для ручного движения:
```typescript
// src/renderer/pixi/systems/Movement.ts
update(deltaMs: number): void {
  for (const [, state] of this.agents) {
    if (state.isMoving) {
      this.updateMovement(state, deltaMs);  // Только если вызван moveAgentTo()
    }
    // Auto-wander disabled — agents stay at spawn position
  }
}
```
**API остался:** `moveAgentTo(id, x, y)` — для будущей логики движения.
**Commit:** `e5548c6`

---

### 🏗️ Архитектура (текущее состояние)

```
┌─────────────────────────────────────────────────────────────┐
│ AGENT STATUS FLOW                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  tmux session (agent работает здесь)                       │
│       │                                                     │
│       ├──→ healthCheck каждые 10 сек                       │
│       │         │                                           │
│       │         ├──→ capturePane() → сравнение с previous  │
│       │         │         │                                 │
│       │         │         └──→ activityDetected = true     │
│       │         │                     │                     │
│       │         │                     ▼                     │
│       │         │              idle → working               │
│       │         │                                           │
│       │         └──→ idleTime > 10s → working → idle       │
│       │                                                     │
│       └──→ viewer PTY (UI терминал)                        │
│             НЕ влияет на статус (isViewer: true)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ VISUAL COMPONENTS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AnimatedAgent (PixiJS)                                    │
│       ├── animatedSprite (кадровая анимация 2-4 fps)       │
│       │       └── idle/working кадры по статусу            │
│       │                                                     │
│       └── statusBadge (IDLE/WORKING/ERROR)                 │
│               └── цвет фона по статусу                     │
│                                                             │
│  MovementSystem                                             │
│       ├── auto-wander: ОТКЛЮЧЁН                            │
│       └── moveAgentTo(): готов для будущего использования  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 📁 Изменённые файлы (эта сессия)

| Файл | Изменение |
|------|-----------|
| `src/main/terminal/pty-manager.ts` | UTF-8 locale в env |
| `src/main/agents/manager.ts` | Activity detection через capturePane |
| `src/main/tmux/capture.ts` | Возвращает последние N строк |
| `src/renderer/pixi/systems/Movement.ts` | Отключён auto-wander |

---

### ✅ Коммиты сессии

```
e5548c6 fix: disable auto-wander + show last terminal lines in tooltip
b0d40c1 fix: terminal encoding + activity detection via tmux capture
```

---

### 🎯 Следующие задачи

1. **Phase C: Multi-Agent Control (M12-M15)**
   - M12: Agent commands (start/stop/restart)
   - M13: Multi-select agents
   - M14: Group commands
   - M15: Agent templates

2. **Будущее улучшение:** Логика когда и куда агенты должны двигаться
   - API `moveAgentTo(id, x, y)` готов
   - Нужно придумать триггеры для движения

---

### 🚀 Команды для продолжения

```bash
cd /Users/admin/projects/optimi-mac/agent-colony && pnpm dev
```

---

### 📝 Resume Prompt

```
Продолжи работу над Agent Colony V3

Текущий статус:
- Phase B (Information Layer) ✅ завершена
- Все багфиксы применены ✅
- Агенты остаются на месте spawn (auto-wander отключён)
- Activity detection работает через tmux capture-pane
- API moveAgentTo() готов для будущей логики движения

Следующий шаг: Phase C (Multi-Agent Control)
- M12: Agent commands (start/stop/restart)
- M13: Multi-select agents
- M14: Group commands
- M15: Agent templates

Или: Придумать логику когда агенты должны двигаться
```

---

## 🔗 Context

**Completed phases:**
- Phase A (UX Fixes) ✅ — commits: faa090b, e2f7289, 3818f86, 796ae26, 837d485
- Phase B (Information Layer) ✅ — commits: 5d6e6d2, 3dffb3c, 665a9f1, c0e6b53, 0184c8a, 345a93a
- Bugfix Session ✅ — commits: b0d40c1, e5548c6
