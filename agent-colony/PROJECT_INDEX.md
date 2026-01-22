# Project Index: Agent Colony

**Generated:** 2026-01-22
**Source Files:** 46 TypeScript/TSX
**Status:** Phase A+B Complete, Phase C Ready

---

## Vision

> "AI Agent Colony Visual Management Interface — геймифицированный интерфейс для управления AI-агентами в стиле MMORPG/RTS"

**Target:** Non-tech founders, vibe coders, developers с agentic AI mindset

---

## Project Structure

```
agent-colony/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts            # Entry point, IPC handlers
│   │   ├── preload.ts          # Bridge main↔renderer
│   │   ├── agents/             # Agent lifecycle management
│   │   │   ├── manager.ts      # AgentManager class (spawn/kill/health)
│   │   │   ├── registry.ts     # In-memory agent storage
│   │   │   ├── events.ts       # EventEmitter for agent events
│   │   │   ├── health.ts       # Health check logic
│   │   │   └── types.ts        # Agent, AgentRole, AgentStatus types
│   │   ├── terminal/           # PTY management
│   │   │   └── pty-manager.ts  # node-pty wrapper, tmux attach
│   │   ├── tmux/               # tmux integration
│   │   │   ├── spawn.ts        # tmux new-session
│   │   │   ├── kill.ts         # tmux kill-session
│   │   │   ├── capture.ts      # tmux capture-pane
│   │   │   ├── send.ts         # tmux send-keys
│   │   │   └── list.ts         # tmux list-sessions
│   │   └── db/                 # SQLite persistence
│   │       ├── index.ts        # better-sqlite3 init
│   │       ├── models/agent.ts # CRUD operations
│   │       └── migrations/     # Schema migrations
│   │
│   └── renderer/               # React Frontend
│       ├── index.tsx           # React entry point
│       ├── App.tsx             # Main component, state management
│       ├── components/
│       │   ├── PixiCanvas.tsx      # PixiJS canvas wrapper
│       │   ├── DetailPanel.tsx     # Agent detail sidebar + terminal
│       │   ├── TerminalPanel.tsx   # xterm.js terminal
│       │   ├── SpawnModal.tsx      # Agent spawn dialog
│       │   ├── HudOverlay.tsx      # HUD statistics
│       │   ├── Minimap.tsx         # Minimap overlay
│       │   ├── ActivityTimeline.tsx # Event feed
│       │   └── TerminalTooltip.tsx # Hover preview
│       ├── pixi/
│       │   ├── setup.ts            # PixiJS app creation
│       │   ├── AgentLayer.ts       # Agent container + animations
│       │   ├── types.ts            # Pixi-specific types
│       │   ├── layers/
│       │   │   ├── TilemapLayer.ts   # Background tiles
│       │   │   └── BuildingsLayer.ts # Building sprites
│       │   ├── sprites/
│       │   │   ├── SpriteLoader.ts   # Asset loading
│       │   │   ├── AgentSprite.ts    # Static sprite
│       │   │   └── AnimatedAgent.ts  # Animated sprite + badge
│       │   ├── animations/
│       │   │   ├── frames.ts         # Animation frame definitions
│       │   │   └── states.ts         # State machine
│       │   └── systems/
│       │       └── Movement.ts       # Movement system (disabled)
│       └── utils/
│           └── severity.ts         # Error severity classification
│
├── assets/                     # Sprites, fonts, sounds
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config (renderer)
├── tsconfig.main.json         # TypeScript config (main)
└── vite.config.ts             # Vite bundler config
```

---

## Entry Points

| Entry | Path | Purpose |
|-------|------|---------|
| **Main Process** | `src/main/index.ts` | Electron app, IPC handlers |
| **Renderer** | `src/renderer/index.tsx` | React app mount |
| **Preload** | `src/main/preload.ts` | Safe bridge (contextBridge) |

---

## Core Modules

### AgentManager (`src/main/agents/manager.ts`)

Central agent lifecycle controller.

**Methods:**
- `init()` — Load agents from SQLite, start health checks
- `spawnAgent(options)` — Create tmux session, spawn agent
- `killAgent(id)` — Graceful shutdown with Ctrl-C → kill
- `sendCommand(id, command)` — Send keys to tmux
- `pauseAll()` — Pause all agents (Ctrl-Z)
- `shutdown()` — Graceful app exit

**Events (via `agentEvents`):**
- `agent:spawned` — New agent created
- `agent:updated` — Status/metrics changed
- `agent:killed` — Agent terminated
- `agent:error` — Error occurred
- `health:checked` — Health check completed

### PTY Manager (`src/main/terminal/pty-manager.ts`)

Terminal emulation via node-pty.

**Key Features:**
- `spawn(agentId, cwd)` — New shell
- `attachToTmux(agentId, session)` — Attach to existing tmux
- `isViewer: true` — Viewer mode (no activity detection)
- UTF-8 locale configured (`LANG=en_US.UTF-8`)

### PixiJS Rendering (`src/renderer/pixi/`)

2D canvas rendering with pixi.js v8.

**Layers (bottom to top):**
1. `TilemapLayer` — Background grass tiles
2. `BuildingsLayer` — Static building sprites
3. `AgentLayer` — Animated agent sprites

**Features:**
- `pixi-viewport` for pan/zoom
- Status badges above agents
- Click/hover events
- Frame-based animations (2-4 FPS)

---

## Data Types

### Agent (`src/main/agents/types.ts`)

```typescript
interface Agent {
  id: string;
  role: 'Architect' | 'Coder' | 'Tester' | 'Reviewer';
  status: 'idle' | 'working' | 'error' | 'paused';
  project: { name: string; path: string };
  process: { tmuxSession: string; pid: number | null };
  metrics: { health, contextUsage, uptime, lastActivity };
  position: { x: number; y: number };
  hookStatus: { active, currentMolecule, totalMolecules, hookPath };
  createdAt: number;
}
```

### IPC API (`src/main/preload.ts`)

```typescript
window.electronAPI = {
  // Agent Management
  spawnAgent(options): Promise<Agent>
  killAgent(id): Promise<void>
  listAgents(): Promise<Agent[]>
  sendCommand(id, command): Promise<void>
  pauseAll(): Promise<{ paused, skipped, errors }>

  // Event Listeners (return unsubscribe fn)
  onAgentSpawned(callback): () => void
  onAgentUpdated(callback): () => void
  onAgentKilled(callback): () => void
  onAgentError(callback): () => void

  // Terminal
  terminalAttachTmux(agentId, session): Promise<boolean>
  terminalWrite(agentId, data): Promise<boolean>
  terminalCapture(agentId, lines?): Promise<string[]>
  onTerminalData(callback): () => void
}
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | 40.0.0 | Desktop app framework |
| `react` | 18.3.1 | UI framework |
| `pixi.js` | 8.15.0 | 2D WebGL rendering |
| `pixi-viewport` | 6.0.3 | Pan/zoom |
| `better-sqlite3` | 12.6.2 | Embedded database |
| `node-pty` | 1.1.0 | Terminal emulation |
| `xterm` | 5.3.0 | Terminal UI |
| `react-resizable-panels` | 2.1.9 | Resizable sidebar |

---

## Quick Start

```bash
cd agent-colony
pnpm install
pnpm dev
```

**Scripts:**
- `pnpm dev` — Development mode (hot reload)
- `pnpm build` — Production build
- `pnpm preview` — Run production build

---

## Implementation Status

### Phase A: UX Fixes ✅

| Molecule | Status |
|----------|--------|
| M1: Pan карты | ✅ Done |
| M2: Zoom | ✅ Done |
| M3: Resizable sidebar | ✅ Done |
| M4: Hotkeys 1-9 | ✅ Done |
| M5: Emergency Pause All | ✅ Done |

### Phase B: Information Layer ✅

| Molecule | Status |
|----------|--------|
| M6: Agent status badge | ✅ Done |
| M7: Terminal preview on hover | ✅ Done |
| M8: HUD + resource meter | ✅ Done |
| M9: Minimap | ✅ Done |
| M10: Activity timeline | ✅ Done |
| M11: Error severity levels | ✅ Done |

### Phase C: Multi-Agent Control (Next)

| Molecule | Status |
|----------|--------|
| M12: Agent filtering UI | ⬜ Pending |
| M13: Batch controls | ⬜ Pending |
| M14: Dependency graph | ⬜ Pending |
| M15: macOS notifications | ⬜ Pending |

---

## Known Issues & Solutions

| Issue | Solution | File |
|-------|----------|------|
| UTF-8 encoding | `LANG=en_US.UTF-8` in env | `pty-manager.ts` |
| Activity detection | Compare tmux pane content hashes | `manager.ts` |
| Tooltip shows wrong lines | Use `.slice(-lines)` for last N | `capture.ts` |
| Auto-wander unwanted | Disabled in MovementSystem | `Movement.ts` |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON APP                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐         IPC          ┌─────────────┐  │
│  │ Main Process│ ◄──────────────────► │  Renderer   │  │
│  │             │    contextBridge      │  (React)    │  │
│  │ ┌─────────┐ │                      │             │  │
│  │ │AgentMgr │ │ agent:spawned        │ ┌─────────┐ │  │
│  │ │         │─┼──────────────────────┼►│  App    │ │  │
│  │ │ tmux    │ │ agent:updated        │ │  State  │ │  │
│  │ │ sqlite  │ │                      │ └────┬────┘ │  │
│  │ └─────────┘ │                      │      │      │  │
│  │             │                      │      ▼      │  │
│  │ ┌─────────┐ │ terminal:data        │ ┌─────────┐ │  │
│  │ │PTYMgr   │─┼──────────────────────┼►│PixiJS  │ │  │
│  │ │node-pty │ │                      │ │Canvas  │ │  │
│  │ └─────────┘ │                      │ └─────────┘ │  │
│  └─────────────┘                      └─────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## File Quick Reference

| Need | File | Line |
|------|------|------|
| Add IPC handler | `src/main/index.ts` | ~90 |
| Add preload API | `src/main/preload.ts` | ~54 |
| Agent spawn logic | `src/main/agents/manager.ts` | ~120 |
| Health check | `src/main/agents/health.ts` | — |
| tmux capture | `src/main/tmux/capture.ts` | — |
| React state | `src/renderer/App.tsx` | ~25 |
| PixiJS setup | `src/renderer/pixi/setup.ts` | — |
| Agent rendering | `src/renderer/pixi/AgentLayer.ts` | — |
| Terminal UI | `src/renderer/components/TerminalPanel.tsx` | — |
| Severity utils | `src/renderer/utils/severity.ts` | — |

---

_Last updated: 2026-01-22_
