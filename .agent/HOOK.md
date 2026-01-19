# HOOK: Agent Colony Implementation - Phase 1

**Status:** 🔴 ACTIVE
**Created:** 2026-01-20
**Type:** Implementation Convoy
**Project:** Agent Colony - Core Infrastructure

---

## 📋 Convoy Overview

**Goal:** Создать рабочую инфраструктуру Agent Colony MVP
**Output:** Electron app + tmux manager + SQLite + agent lifecycle
**Phase:** 1 of 4 (Core Infrastructure)

**Tech Stack (из research):**
- Electron + React + TypeScript
- PixiJS v8 + @pixi/react (Phase 2)
- node-pty + tmux
- SQLite (WAL mode)
- Zustand

---

## 🚀 Molecules

### M1: Electron Scaffold ✅ COMPLETED

**Goal:** Базовый Electron app с React + TypeScript

**Tasks:**
- [x] Инициализировать Electron проект (pnpm create)
- [x] Настроить electron-builder для macOS
- [x] Создать main process entry point
- [x] Создать renderer с React
- [x] Настроить IPC между main/renderer
- [x] Добавить hot reload для разработки

**Files:**
```
agent-colony/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts          # Main process
│   │   └── preload.ts        # Preload script
│   └── renderer/
│       ├── index.html
│       ├── index.tsx
│       ├── App.tsx
│       └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .gitignore
└── README.md
```

**Acceptance:**
- [x] Все файлы созданы (12 файлов)
- [x] package.json с правильными dependencies
- [x] IPC настроен через contextBridge (безопасно)
- [x] TypeScript конфигурация для main и renderer
- [x] Vite настроен для dev и build

---

### M2: tmux Manager Core ✅ COMPLETED

**Goal:** Spawn/kill tmux сессий для агентов

**Tasks:**
- [x] Создать tmux service (spawn, kill, list)
- [x] Реализовать безопасный spawn (execFile, не exec)
- [x] Добавить session naming convention
- [x] Создать types для tmux операций
- [x] Интегрировать с main process

**Files:**
```
src/main/
├── tmux/
│   ├── index.ts              # Public API
│   ├── spawn.ts              # Spawn session
│   ├── kill.ts               # Kill session
│   ├── list.ts               # List sessions
│   └── types.ts              # TmuxSession, TmuxError
```

**Security (из design doc):**
```typescript
// ✅ SECURE: execFile with array args
execFile('tmux', ['new-session', '-s', agentName, '-c', workDir]);

// ❌ VULNERABLE: exec with interpolation
exec(`tmux new-session -s ${agentName}`);
```

**Acceptance:**
- [x] Можно spawn tmux session
- [x] Можно kill session gracefully
- [x] Можно list active sessions
- [x] No command injection possible

---

### M3: SQLite Persistence ⚪ PENDING

**Goal:** Сохранение состояния агентов в SQLite

**Tasks:**
- [ ] Настроить better-sqlite3 (sync) или sqlite3 (async)
- [ ] Включить WAL mode для concurrency
- [ ] Создать schema (agents, metrics_snapshots)
- [ ] Реализовать migrations
- [ ] Добавить retry strategy для locked DB

**Files:**
```
src/main/
├── db/
│   ├── index.ts              # Database instance
│   ├── migrations/
│   │   └── 001_initial.sql
│   ├── models/
│   │   ├── agent.ts
│   │   └── metrics.ts
│   └── retry.ts              # Retry with backoff
```

**Schema (из design doc):**
```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  role TEXT,
  status TEXT,
  project_path TEXT,
  tmux_session TEXT,
  created_at INTEGER,
  last_seen INTEGER
);

CREATE TABLE metrics_snapshots (
  id INTEGER PRIMARY KEY,
  agent_id TEXT,
  timestamp INTEGER,
  metrics JSON
);
```

**Acceptance:**
- [ ] DB создаётся при первом запуске
- [ ] CRUD операции работают
- [ ] WAL mode включён
- [ ] Retry при SQLITE_BUSY

---

### M4: Agent Lifecycle ⚪ PENDING

**Goal:** Полный цикл жизни агента (spawn → monitor → kill)

**Tasks:**
- [ ] Создать AgentManager class
- [ ] Реализовать spawn agent flow
- [ ] Добавить periodic health check (10 sec)
- [ ] Реализовать graceful shutdown
- [ ] Интегрировать с SQLite persistence
- [ ] Добавить EventEmitter для UI updates

**Files:**
```
src/main/
├── agents/
│   ├── manager.ts            # AgentManager class
│   ├── registry.ts           # In-memory agent map
│   ├── health.ts             # Health check logic
│   ├── events.ts             # EventEmitter setup
│   └── types.ts              # Agent data model
```

**Agent Data Model (из design doc):**
```typescript
interface Agent {
  id: string;
  role: 'Architect' | 'Coder' | 'Tester' | 'Reviewer';
  status: 'idle' | 'working' | 'error' | 'paused';
  project: { name: string; path: string };
  process: { tmuxSession: string; pid: number };
  metrics: { health: string; contextUsage: number | null; uptime: number };
  position: { x: number; y: number };
  hookStatus: { active: boolean; currentMolecule: string | null };
}
```

**Acceptance:**
- [ ] Agent появляется в registry после spawn
- [ ] Health check обновляет status
- [ ] Graceful shutdown работает
- [ ] Events доходят до renderer через IPC

---

## 📊 Progress Tracking

| Molecule | Status | Commit | Notes |
|----------|--------|--------|-------|
| M1: Electron Scaffold | ✅ COMPLETED | ✅ | 12 files created |
| M2: tmux Manager | ✅ COMPLETED | ✅ | 6 files, 403 lines |
| M3: SQLite Persistence | ⚪ PENDING | - | Next |
| M4: Agent Lifecycle | ⚪ PENDING | - | |

**Overall:** 2/4 completed (50%)

---

## 🎯 Phase 1 Success Criteria

**Phase 1 считается завершённой когда:**
- [ ] Electron app запускается (`pnpm dev`)
- [ ] Можно spawn tmux session для агента
- [ ] Агенты сохраняются в SQLite
- [ ] Health check работает (10 sec interval)
- [ ] IPC доставляет events в renderer
- [ ] Graceful shutdown при закрытии app

---

## 🔄 Handoff Notes

**Starting:** 2026-01-20
**Current Focus:** M1 - Electron Scaffold

---

## 📝 Commit Protocol

**После каждой молекулы:**
```bash
git add .
git commit -m "impl: complete M[N] - [description]"
```

**Examples:**
```bash
git commit -m "impl: complete M1 - electron scaffold with React"
git commit -m "impl: complete M2 - tmux manager core"
git commit -m "impl: complete M3 - SQLite persistence"
git commit -m "impl: complete M4 - agent lifecycle"
```

---

## 🚨 Smart Delegate Reminder

**Opus планирует, Sonnet кодирует:**
- M1-M4: использовать Task(model: "sonnet") для coding
- Opus: только planning, review, integration

---

**Last Updated:** 2026-01-20
**Owner:** Claude Opus 4.5
