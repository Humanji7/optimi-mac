# tmux-manager Prototype

Prototype for Agent Colony - manages Claude Code and Codex CLI agents in tmux sessions.

## Features

- **spawn-agent.js** - Spawn agents in tmux sessions
- **monitor-metrics.js** - Monitor CPU/memory, detect hung agents
- **recover-sessions.js** - Session persistence and recovery

## Prerequisites

```bash
# tmux must be installed
brew install tmux  # macOS
apt install tmux   # Ubuntu/Debian
```

## Installation

```bash
cd .agent/prototypes/tmux-manager
npm install
```

## Usage

### Spawn Agent

```javascript
const { AgentSpawner } = require('./spawn-agent');

const spawner = new AgentSpawner();

// Spawn Claude Code agent
const session = await spawner.spawnAgent({
  type: 'claude',
  name: 'agent-1',
  workdir: '/path/to/project'
});

console.log(`Started: ${session.sessionName}`);

// List sessions
const sessions = spawner.listSessions();

// Send command
spawner.sendCommand('agent-1', '/help');

// Kill session
spawner.killSession('agent-1');
```

### Monitor Metrics

```javascript
const { MetricsMonitor } = require('./monitor-metrics');

const monitor = new MetricsMonitor({
  interval: 5000,      // Check every 5s
  hangTimeout: 60000,  // 60s no-activity = hung
  cpuThreshold: 90,    // Alert at 90% CPU
  memoryThreshold: 2048 // Alert at 2GB RAM
});

monitor.on('metrics', (data) => {
  console.log(`${data.id}: CPU ${data.cpu}%, MEM ${data.memoryMB}MB`);
});

monitor.on('hung', (data) => {
  console.error(`Agent ${data.id} is hung!`);
});

monitor.registerAgent('agent-1', 12345);
monitor.start();

// Report activity when stdout received
monitor.reportActivity('agent-1');

// Parse context usage
const ctx = monitor.parseContextUsage(stdoutBuffer);
// ctx = 45.2 (percentage) or null
```

### Session Recovery

```javascript
const { SessionRecovery } = require('./recover-sessions');
const { AgentSpawner } = require('./spawn-agent');

const spawner = new AgentSpawner();
const recovery = new SessionRecovery(spawner);

// Setup shutdown handler (saves state on SIGINT/SIGTERM)
recovery.setupShutdownHandler();

// Register active sessions
recovery.registerSession({
  id: 'agent-1',
  sessionName: 'agent-1',
  type: 'claude',
  workdir: '/project'
});

// On app restart - recover sessions
const report = await recovery.recover();
console.log(`Reconnected: ${report.reconnected.length}`);
console.log(`Respawned: ${report.respawned.length}`);
console.log(`Failed: ${report.failed.length}`);
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Your Application              │
├─────────────────────────────────────────┤
│  AgentSpawner     MetricsMonitor        │
│  ├── spawn()      ├── start()           │
│  ├── kill()       ├── registerAgent()   │
│  └── sendCmd()    └── on('metrics')     │
├─────────────────────────────────────────┤
│  SessionRecovery                        │
│  ├── saveState()                        │
│  ├── recover()                          │
│  └── setupShutdownHandler()             │
└─────────────────────────────────────────┘
         ↓              ↓
    ┌─────────┐    ┌─────────┐
    │  tmux   │    │  tmux   │
    │ session │    │ session │
    └─────────┘    └─────────┘
```

## Events

### AgentSpawner
- `spawned` - Agent started successfully
- `killed` - Session terminated
- `error` - Error occurred

### MetricsMonitor
- `metrics` - Regular metrics update
- `hung` - Agent inactive >60s
- `highCpu` - CPU >90%
- `highMemory` - Memory >2GB
- `started` / `stopped` - Monitor lifecycle

## Files

| File | Purpose | Size |
|------|---------|------|
| spawn-agent.js | tmux session management | ~240 lines |
| monitor-metrics.js | Metrics & detection | ~260 lines |
| recover-sessions.js | Persistence & recovery | ~270 lines |

## For Agent Colony MVP

This prototype demonstrates:
1. How to spawn Claude/Codex in persistent tmux sessions
2. How to monitor agent health (CPU, memory, hangs)
3. How to parse context usage from stdout
4. How to survive app restarts

**Next steps for production:**
- Integrate with Electron IPC
- Add xterm.js for live terminal view
- Connect to PixiJS visualization layer
