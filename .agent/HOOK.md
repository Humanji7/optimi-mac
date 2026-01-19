# HOOK: Agent Colony Research Phase

**Status:** 🔴 ACTIVE
**Created:** 2026-01-19
**Type:** Research Convoy (3 sessions)
**Project:** Agent Colony - Multi-Agent Management System

---

## 📋 Convoy Overview

**Goal:** Провести comprehensive research для Agent Colony MVP
**Output:** 3 research reports + working prototypes
**Sessions:** 3 сессии Claude (2h + 2h + 3h)

---

## 🚀 Molecules

### M1: Multi-Agent Frameworks Research ✅ COMPLETED

**Goal:** Понять паттерны оркестрации агентов

**Tasks:**
- [ ] Изучить CrewAI (role-based agents)
- [ ] Изучить Microsoft AutoGen (conversational)
- [ ] Изучить LangChain Multi-Agent (graph-based)
- [ ] Изучить BabyAGI (task decomposition)
- [ ] Ответить на вопросы:
  - Как передают контекст между агентами?
  - Паттерны коммуникации (broadcast/direct/queue)?
  - Error handling strategies?
  - Визуализация агентов?
- [ ] Создать сравнительную таблицу
- [ ] Выделить best practices
- [ ] Оценить применимость к Agent Colony

**Output:**
```
docs/research/01-multi-agent-frameworks.md
- Comparison table
- Best practices
- Recommendations
```

**Estimated Time:** 2 часа
**Agent Type:** sc:deep-research

---

### M2: Pixel Game Engines Research ⚪ PENDING

**Goal:** Выбрать оптимальный engine для визуализации

**Phase 1: Research (1h)**
- [ ] Изучить Phaser.js (full game engine)
- [ ] Изучить PixiJS (WebGL, lightweight)
- [ ] Изучить Kaboom.js (minimalist)
- [ ] Изучить Canvas API (native)
- [ ] Критерии оценки:
  - FPS при 20+ анимированных sprites
  - Bundle size (важно для Electron)
  - React/Electron интеграция
  - Community support
  - Developer experience

**Phase 2: Prototypes (1h)**
- [ ] Создать mini-demo с Phaser
- [ ] Создать mini-demo с PixiJS
- [ ] Создать mini-demo с Canvas API
- [ ] Benchmark: FPS, memory, bundle size
- [ ] Оценить DX (developer experience)

**Output:**
```
docs/research/02-pixel-engines-comparison.md
- Benchmarks (FPS, memory, bundle)
- Code examples
- Recommendation для MVP

.agent/prototypes/
├── phaser-demo/
├── pixi-demo/
└── canvas-demo/
```

**Estimated Time:** 2 часа
**Agent Type:** sc:deep-research + coding

---

### M3: Process Management + Final Prototypes ⚪ PENDING

**Goal:** Надёжное управление tmux + процессами + финальные прототипы

**Part 1: Research (1.5h)**
- [ ] Изучить tmux automation (tmux.js, libtmux)
- [ ] Изучить blessed/blessed-contrib (terminal UI)
- [ ] Изучить node-pty (pseudo-terminals)
- [ ] Изучить systeminformation (metrics)
- [ ] Вопросы:
  - Как детектировать зависший агент?
  - Как безопасно парсить stdout/stderr?
  - Как восстановить сессии после reboot?
  - Как интегрировать live-терминал в Electron?

**Part 2: Working Prototype (1.5h)**
- [ ] Создать tmux-manager prototype
  - spawn-agent.js (запуск Claude Code/Codex)
  - monitor-metrics.js (парсинг context usage)
  - recover-sessions.js (восстановление после reboot)
- [ ] Тестовый сценарий:
  - Spawn 5 Claude Code сессий
  - Kill одну → проверить detection
  - Restart app → recover сессии
  - Capture stdout → parse context %

**Output:**
```
docs/research/03-process-management.md
- tmux automation best practices
- Metrics detection strategies
- Recovery mechanisms

.agent/prototypes/tmux-manager/
├── spawn-agent.js
├── monitor-metrics.js
├── recover-sessions.js
└── README.md
```

**Estimated Time:** 3 часа
**Agent Type:** sc:deep-research + coding

---

## 📊 Progress Tracking

| Molecule | Status | Output Created | Notes |
|----------|--------|----------------|-------|
| M1 | ✅ COMPLETED | ✅ | Multi-agent frameworks |
| M2 | ⚪ PENDING | ❌ | Pixel engines + demos |
| M3 | ⚪ PENDING | ❌ | Process mgmt + prototype |

**Overall:** 1/3 completed (33%)

---

## 🎯 Success Criteria

**Research считается завершённым когда:**
- [x] Design document написан (✅ done)
- [ ] Все 3 research reports созданы
- [ ] Working prototypes работают (demos + tmux-manager)
- [ ] Есть чёткая рекомендация по tech stack
- [ ] Можно начинать implementation без блокеров

---

## 🔄 Handoff Notes

**Для следующей сессии:**
```
Команда: "Продолжи research с HOOK.md"

Контекст:
- Design approved: docs/plans/2026-01-19-agent-colony-design.md
- Current: M1 (Multi-Agent Frameworks Research)
- Используй sc:deep-research agent
- Target output: docs/research/01-multi-agent-frameworks.md
```

---

## 📝 Commit Protocol

**После каждой молекулы:**
```bash
git add .
git commit -m "research: complete M[N] - [description]"
```

**Example:**
```bash
git commit -m "research: complete M1 - multi-agent frameworks analysis"
git commit -m "research: complete M2 - pixel engines benchmarks + demos"
git commit -m "research: complete M3 - process management + tmux prototype"
```

---

## 🚨 Important Notes

- **Smart Delegate:** Используй Task(model: "sonnet") для coding частей
- **No bloat:** Только релевантные frameworks/engines (не изучать всё подряд)
- **Practical focus:** Приоритет на применимость к Agent Colony, не теория
- **Working code:** Все prototypes должны запускаться (npm start / node script.js)

---

**Last Updated:** 2026-01-19
**Owner:** Claude Sonnet 4.5
