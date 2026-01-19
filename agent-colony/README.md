# Agent Colony

Electron + React + TypeScript приложение для визуального управления AI-агентами.

## Tech Stack

- **Electron** - Desktop application framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **pnpm** - Package manager

## Development

### Prerequisites

- Node.js LTS (18+)
- pnpm

### Install Dependencies

```bash
cd agent-colony
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Это запустит Vite dev server. После этого в отдельном терминале запусти Electron:

```bash
pnpm preview
```

### Build

```bash
pnpm build
```

Создаст production build в `dist/` и упакует в DMG файл в `release/`.

## Project Structure

```
agent-colony/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   └── preload.ts     # Context bridge
│   └── renderer/          # React app
│       ├── index.html     # HTML template
│       ├── index.tsx      # React entry
│       └── App.tsx        # Main component
├── package.json
├── tsconfig.json          # TypeScript config (renderer)
├── tsconfig.node.json     # TypeScript config (main process)
└── vite.config.ts         # Vite config
```

## IPC Communication

Main process и renderer общаются через безопасный IPC:

- `window.electronAPI.getAppInfo()` - получить версию и платформу
- `window.electronAPI.onAgentUpdate()` - подписаться на события агентов (для будущего)

## Security

- ✅ `contextIsolation: true` - изоляция контекста
- ✅ `nodeIntegration: false` - отключена интеграция Node.js в renderer
- ✅ `contextBridge` - безопасный API между процессами

## Phase 1 Roadmap

- [x] M1: Electron Scaffold
- [ ] M2: tmux Manager Core
- [ ] M3: SQLite Persistence
- [ ] M4: Agent Lifecycle
