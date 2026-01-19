# M3: Process Management Research

**Date:** 2026-01-20
**Goal:** Надёжное управление tmux + процессами для Agent Colony
**Context:** Spawn/monitor/recover Claude Code и Codex CLI сессий

---

## Executive Summary

**Рекомендуемый стек:**
- **node-pty** - spawn pseudo-terminals (Microsoft, production-ready)
- **systeminformation** - метрики CPU/memory по процессам
- **tmux** - session persistence через native CLI (не wrapper)
- **Claude Code statusline JSON** - парсинг context usage

---

## Ключевые вопросы и ответы

### 1. Как детектировать зависший агент?

**Решение: Комбинация heartbeat + metrics**

```javascript
// 1. Heartbeat через stdout activity
const lastActivity = new Map(); // pid -> timestamp

ptyProcess.onData((data) => {
  lastActivity.set(pid, Date.now());
});

// 2. Timeout detection
const HANG_THRESHOLD = 60000; // 60 секунд без активности
setInterval(() => {
  for (const [pid, timestamp] of lastActivity) {
    if (Date.now() - timestamp > HANG_THRESHOLD) {
      emitEvent('agent:hung', { pid });
    }
  }
}, 10000);

// 3. CPU spike detection через systeminformation
const si = require('systeminformation');
const proc = await si.processLoad('claude');
if (proc[0]?.cpu > 90) {
  emitEvent('agent:high-cpu', { pid: proc[0].pid });
}
```

**Признаки зависания:**
- Нет stdout >60 сек при активной задаче
- CPU 100% без прогресса
- Memory leak (постоянный рост RSS)

---

### 2. Как безопасно парсить stdout/stderr?

**Решение: Stream buffering + regex extraction**

```javascript
class OutputParser {
  constructor() {
    this.buffer = '';
  }

  feed(data) {
    this.buffer += data;

    // Парсинг context usage из Claude Code statusline
    // JSON приходит через stdin statusline команды
    const contextMatch = this.buffer.match(
      /"used_percentage":\s*(\d+(?:\.\d+)?)/
    );
    if (contextMatch) {
      return { contextUsage: parseFloat(contextMatch[1]) };
    }

    // Парсинг completion markers
    if (this.buffer.includes('Task completed')) {
      return { status: 'completed' };
    }

    // Очистка буфера (keep last 10KB)
    if (this.buffer.length > 10240) {
      this.buffer = this.buffer.slice(-5120);
    }

    return null;
  }
}
```

**Claude Code Context Parsing:**
```javascript
// Через statusline JSON (официальный способ)
// ~/.claude/settings.json:
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}

// statusline.sh получает JSON:
{
  "context_window": {
    "used_percentage": 45.2,
    "remaining_percentage": 54.8,
    "total_input_tokens": 12500,
    "total_output_tokens": 3200
  }
}
```

---

### 3. Как восстановить сессии после reboot?

**Решение: tmux session persistence + state file**

```javascript
// 1. Сохранение state перед shutdown
const STATE_FILE = '~/.agent-colony/sessions.json';

function saveState(sessions) {
  const state = sessions.map(s => ({
    id: s.id,
    name: s.name,
    tmuxSession: s.tmuxSession,
    workdir: s.workdir,
    lastCommand: s.lastCommand,
    contextUsage: s.contextUsage
  }));
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// 2. Восстановление после reboot
async function recoverSessions() {
  // Проверяем живые tmux сессии
  const { stdout } = await exec('tmux list-sessions -F "#{session_name}"');
  const liveSessions = stdout.trim().split('\n');

  // Загружаем сохранённый state
  const savedState = JSON.parse(fs.readFileSync(STATE_FILE));

  for (const saved of savedState) {
    if (liveSessions.includes(saved.tmuxSession)) {
      // Сессия жива - переподключаемся
      await attachToSession(saved.tmuxSession);
    } else {
      // Сессия умерла - пересоздаём
      await respawnAgent(saved);
    }
  }
}

// 3. tmux автоматически сохраняет сессии
// Даже после закрытия терминала сессия жива
```

**tmux persistence commands:**
```bash
# Создать detached сессию
tmux new-session -d -s agent-1 "claude"

# Список живых сессий
tmux list-sessions

# Attach к существующей
tmux attach-session -t agent-1

# Послать команду в сессию
tmux send-keys -t agent-1 "/continue" Enter
```

---

### 4. Как интегрировать live-терминал в Electron?

**Решение: node-pty + xterm.js**

```javascript
// Main process (Electron)
const pty = require('node-pty');
const { ipcMain } = require('electron');

// Spawn pseudo-terminal
const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-256color',
  cols: 120,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

// IPC bridge to renderer
ptyProcess.onData((data) => {
  mainWindow.webContents.send('terminal:data', data);
});

ipcMain.on('terminal:input', (event, data) => {
  ptyProcess.write(data);
});

ipcMain.on('terminal:resize', (event, { cols, rows }) => {
  ptyProcess.resize(cols, rows);
});
```

```javascript
// Renderer process (React + xterm.js)
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const term = new Terminal({
  cursorBlink: true,
  theme: { background: '#1a1a2e' }
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();

// Receive data from main process
window.electron.onTerminalData((data) => {
  term.write(data);
});

// Send input to main process
term.onData((data) => {
  window.electron.sendTerminalInput(data);
});
```

---

## Technology Comparison

### Pseudo-Terminal Libraries

| Library | Platform | Maintenance | Electron | Notes |
|---------|----------|-------------|----------|-------|
| **node-pty** | All | Microsoft (active) | Native | Winner |
| pty.js | Linux/Mac | Abandoned | - | Don't use |
| child_process | All | Node core | Yes | No PTY features |

**node-pty выбор обоснован:**
- Microsoft поддержка (VSCode использует)
- Node 16+ / Electron 19+ support
- Windows ConPTY + Unix PTY
- 15M+ downloads/month

### tmux Control Options

| Approach | Complexity | Reliability | Notes |
|----------|------------|-------------|-------|
| **Native CLI** | Low | High | `spawn('tmux', [...])` |
| node-tmux | Medium | Medium | Wrapper, less maintained |
| tmux-mcp | Low | High | MCP server (AI-focused) |

**Рекомендация:** Native CLI через child_process

```javascript
const { execSync, spawn } = require('child_process');

// Simple wrapper
const tmux = {
  newSession: (name, cmd) =>
    execSync(`tmux new-session -d -s ${name} "${cmd}"`),

  listSessions: () =>
    execSync('tmux list-sessions -F "#{session_name}"')
      .toString().trim().split('\n'),

  sendKeys: (session, keys) =>
    execSync(`tmux send-keys -t ${session} "${keys}" Enter`),

  killSession: (name) =>
    execSync(`tmux kill-session -t ${name}`)
};
```

### System Metrics

| Library | Features | Size | Notes |
|---------|----------|------|-------|
| **systeminformation** | 50+ functions | 150KB | Winner |
| os-utils | Basic CPU/mem | 10KB | Too simple |
| pidusage | Per-process | 20KB | Good alternative |

**systeminformation API:**
```javascript
const si = require('systeminformation');

// Per-process metrics
const procs = await si.processes();
const claude = procs.list.find(p => p.name.includes('claude'));
console.log(`CPU: ${claude.cpu}%, MEM: ${claude.mem}%`);

// System overview
const load = await si.currentLoad();
console.log(`System CPU: ${load.currentLoad}%`);

const mem = await si.mem();
console.log(`Memory: ${(mem.used / mem.total * 100).toFixed(1)}%`);
```

---

## Architecture for Agent Colony

```
┌─────────────────────────────────────────────────────┐
│                   Electron Main                      │
├─────────────────────────────────────────────────────┤
│  AgentManager                                        │
│  ├── spawn(config) → node-pty                       │
│  ├── monitor() → systeminformation                  │
│  ├── parseOutput() → context/status extraction      │
│  └── recover() → tmux session restoration           │
├─────────────────────────────────────────────────────┤
│  SessionStore (persistent)                           │
│  ├── sessions.json (state backup)                   │
│  └── tmux sessions (process persistence)            │
├─────────────────────────────────────────────────────┤
│  IPC Bridge                                          │
│  ├── terminal:data (pty → renderer)                 │
│  ├── terminal:input (renderer → pty)                │
│  └── agent:metrics (metrics → renderer)             │
└─────────────────────────────────────────────────────┘
          ↓                    ↓
┌─────────────────┐  ┌─────────────────┐
│   tmux session  │  │   tmux session  │
│   (claude-1)    │  │   (codex-1)     │
└─────────────────┘  └─────────────────┘
```

---

## Prototype Structure

```
.agent/prototypes/tmux-manager/
├── package.json
├── spawn-agent.js      # Spawn Claude/Codex в tmux
├── monitor-metrics.js  # CPU/memory + context parsing
├── recover-sessions.js # Session recovery после reboot
└── README.md
```

---

## Best Practices

### 1. Graceful Shutdown
```javascript
process.on('SIGINT', async () => {
  await saveState(activeSessions);
  // Don't kill tmux sessions - they persist
  process.exit(0);
});
```

### 2. Error Boundaries
```javascript
ptyProcess.onExit(({ exitCode, signal }) => {
  if (exitCode !== 0) {
    logger.error(`Agent crashed: exit=${exitCode}, signal=${signal}`);
    emitEvent('agent:crashed', { pid, exitCode, signal });
    // Auto-respawn if configured
  }
});
```

### 3. Resource Limits
```javascript
// Monitor memory leaks
setInterval(async () => {
  const proc = await si.processLoad('claude');
  if (proc[0]?.memRss > 2 * 1024 * 1024 * 1024) { // 2GB
    logger.warn('Agent using >2GB RAM, consider restart');
  }
}, 30000);
```

---

## Sources

- [node-pty (Microsoft)](https://github.com/microsoft/node-pty)
- [systeminformation](https://github.com/sebhildebrandt/systeminformation)
- [Claude Code statusline](https://code.claude.com/docs/en/statusline)
- [Electron + node-pty guide](https://thomasdeegan.medium.com/electron-forge-node-pty-9dd18d948956)
- [tmux-mcp](https://mcp-archive.com/server/tmux-mcp)
- [blessed-contrib](https://github.com/yaronn/blessed-contrib)
