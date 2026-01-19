# Agent Colony - Design Document

**Date:** 2026-01-19
**Status:** Approved
**Version:** 1.0

---

## 📋 Executive Summary

**Agent Colony** - Electron-приложение для визуального управления несколькими AI-агентами (Claude Code, Codex) в стиле RTS/colony management игр.

**MVP Target:** Claude Code + Codex, 4 базовых роли, pixel art визуализация, полная интеграция с optimi-mac.

**Timeline:** 7 недель разработки + 3 сессии research

---

## 🎯 Проблема и решение

### Проблема

При работе с несколькими агентами одновременно (разные проекты, разные терминалы) теряется контроль:
- Кто что делает?
- Какой статус у агента?
- Сколько контекста использовано?
- Где произошли ошибки?
- Всё разбросано по терминалам

### Решение

Единый визуальный интерфейс с игровой эстетикой (pixel art, постирония, стиль Михаила Ого МК), где:
- Агенты = жители колонии
- Каждый работает над своей задачей
- Hover = quick stats
- Click = детальная панель с live-терминалом
- Real-time мониторинг всех метрик

---

## 🎮 User Experience

### Main Screen Layout

```
┌─────────────────────────────────────────────────────┐
│  🎮 Agent Colony Command Center          [⚙️][−][×]│
├─────────────────────────────────────────────────────┤
│                                                     │
│           🗺️ PIXEL MAP (main canvas)               │
│                                                     │
│    [🤖] Architect    [🤖] Coder     [🤖] Tester    │
│     (idle/blink)    (печатает)    (error/red)     │
│    project-alpha   project-beta   project-gamma    │
│                                                     │
│    [+] Spawn new agent                             │
│                                                     │
├──────────────────────────────────┬──────────────────┤
│ 📊 Global Stats:                 │ [Agent Detail]   │
│ • Active: 3/8                    │                  │
│ • Total commits: 12              │ (при клике на    │
│ • Avg context: 45%               │  агента)         │
│                                  │                  │
│ 🎛️ Quick Actions:                │ 💬 Chat          │
│ [Resume All] [Pause All]         │ 📊 Metrics       │
│                                  │ 🖥️ Terminal      │
└──────────────────────────────────┴──────────────────┘
```

### Визуальный стиль

**Концепция:** "RimWorld meets Михаил Ого МК"

- **Pixel art:** 16x16 или 32x32 sprites для агентов
- **Палитра:** приглушённые ретро-цвета (как в RimWorld, но грубее)
- **Юмор:** постирония, пошлые статусы
  - "Архитектор обосрался с планом"
  - "Кодер уснул над клавиатурой"
  - "Тестер нашёл 99 багов"
- **Анимации:** простые (2-3 кадра)
  - Idle: покачивание
  - Working: печатает/стучит молотком
  - Error: горит красным, дымит

### Интерактивность

**Hover на агента:**
```
┌─────────────────────┐
│ 🧠 Architect        │
│ project-alpha       │
│ ❤️ Health: ✅       │
│ 📊 Context: 45%     │
│ ⏱️ Uptime: 1h 23m   │
│ 🔨 HOOK: M2/5       │
└─────────────────────┘
```

**Click на агента → правая панель:**
```
┌─────────────────────────────┐
│ 🧠 Architect                │
│ project-alpha               │
├─────────────────────────────┤
│ Status: Working             │
│ Health: ✅ Healthy          │
│ Context: 45%                │
│ Uptime: 1h 23m              │
│ HOOK: M2/5                  │
├─────────────────────────────┤
│ [Pause] [Resume] [Kill]     │
│ [Attach to terminal]        │
│ [View HOOK.md]              │
├─────────────────────────────┤
│ 💬 Chat window:             │
│ [input field]               │
├─────────────────────────────┤
│ 🖥️ Terminal preview:        │
│ [readonly stdout]           │
└─────────────────────────────┘
```

**Spawn Agent Flow:**
```
[+] Click → Modal with roles
         → Select role (4 cards)
         → Config form (project, agent type)
         → System spawns tmux session
         → Agent appears on map
```

---

## 🏗️ Архитектура

### Технический стек

**Frontend (Electron):**
- Electron (latest stable)
- React (структура UI)
- **Pixel rendering:** TBD после research (Canvas API vs Phaser.js vs PixiJS)
- Tailwind CSS (UI panels)
- Zustand (state management)

**Backend (Node.js):**
- Node.js child_process + tmux automation (гибрид)
- Agent detection: tmux scan + `.agent/agents.json` + HOOK.md parsing
- Metrics collection: парсинг stdout/stderr + файловые watchers
- SQLite (persistence, не real-time)
- EventEmitter (real-time events)

**Интеграция:**
- Полная интеграция с optimi-mac
- Использует `.agent/scripts/` для health checks
- Читает HOOK.md для статуса задач
- Синхронизируется с Health Dashboard

### Архитектура данных

**Agent Data Model:**
```javascript
{
  id: "agent_1234567",
  role: "Architect" | "Coder" | "Tester" | "Reviewer",
  status: "idle" | "working" | "error" | "paused",
  project: {
    name: "project-alpha",
    path: "/Users/admin/projects/project-alpha"
  },
  process: {
    tmuxSession: "agent_1234567",
    pid: 54321,  // protected - validate before kill
    command: "claude-code --session-id=..."
  },
  metrics: {
    health: "healthy" | "warning" | "error" | "unknown",
    contextUsage: 45 | null,  // null если не удалось определить
    uptime: 3600,
    lastActivity: 1737298200,  // Unix timestamp
    commits: 3,
    filesChanged: 12
  },
  position: { x: 120, y: 200 },
  hookStatus: {
    active: true,
    currentMolecule: "M2" | null,
    totalMolecules: 5 | null,
    hookPath: "/path/to/HOOK.md",
    lastParsed: 1737298200
  },
  _version: 1,
  _lastUpdated: 1737298200
}
```

**Источники метрик:**

1. **Health detection:**
   - Парсинг stderr (ошибки → health = "error")
   - Responsiveness check (нет активности >5 мин → warning)
   - Exit codes (crash → error)

2. **Context usage:**
   - Claude Code: парсинг statusline output
   - Codex: анализ `.codex/context/` размера

3. **Activity tracking:**
   - Файловые watchers (git events, file changes)
   - Timestamp последнего stdout/stderr

4. **HOOK.md parsing:**
   - Regex: `/current:\s*M\[?(\d+)\]?/i`
   - Подсчёт молекул

**Persistence:**

- **In-memory (hot):** Map с active agents, обновляется real-time
- **SQLite (cold):** Записывается на critical events + каждые 60 сек
- **Cleanup:** Удаление dead agents (last_seen > 24h)

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

---

## 🔄 Agent Lifecycle

### 1. Spawn Agent

**User flow:**
1. Click [+ Spawn Agent]
2. Modal: выбор роли (4 карточки)
3. Form: проект, тип агента, доп. параметры
4. System: создаёт tmux сессию, запускает агента
5. Agent появляется на карте (случайная позиция)

**System operations:**
```javascript
// 1. Validate inputs
if (!isValidAgentName(agentName)) throw SecurityError;
if (!fs.existsSync(projectPath)) throw ValidationError;

// 2. Check tmux session doesn't exist
if (await tmuxSessionExists(agentName)) throw ConflictError;

// 3. Spawn tmux session
tmux.newSession(agentName, projectPath);

// 4. Start agent
tmux.sendKeys(agentName, "claude-code", "Enter");

// 5. If HOOK.md active
if (hookActive) {
  tmux.sendKeys(agentName, "Продолжи с HOOK.md", "Enter");
}

// 6. Register in Map + SQLite
agents.set(id, agentData);
db.run("INSERT INTO agents ...");

// 7. Place on map
agent.position = {x: random(100, 700), y: random(100, 500)};
```

### 2. Monitoring (Real-time)

**EventEmitter pipeline:**
```
Agent stdout/stderr → EventEmitter → Parser → In-memory update → IPC → UI update
                                   ↓
                            Periodic SQLite flush (60s)
```

**Health checks (каждые 10 сек):**
- Responsiveness (last_activity)
- Process alive (PID check)
- tmux session exists

### 3. User Actions

**From detail panel:**
- **Pause:** `tmux send-keys C-c`
- **Resume:** отправить "Продолжи"
- **Kill:** `tmux kill-session` + cleanup
- **Attach terminal:** открыть полноэкранный терминал
- **Chat:** отправить message в stdin

### 4. Termination (Graceful)

```javascript
async function stopAgent(id) {
  // 1. Save state
  await saveAgentState(agent);

  // 2. Send exit command
  tmux.sendKeys(session, "exit", "Enter");

  // 3. Wait 5 sec
  await sleep(5000);

  // 4. Force kill if needed
  if (isProcessAlive(pid)) {
    tmux.killSession(session);
  }

  // 5. Cleanup
  agents.delete(id);
  db.run("UPDATE agents SET last_seen = ? WHERE id = ?");
}
```

---

## 🛡️ Error Handling & Security

### Категории ошибок

1. **Agent Process Errors:** crash, frozen, OOM, tmux lost
2. **System Errors:** SQLite locked, disk full, tmux not installed
3. **User Input Errors:** invalid path, no HOOK.md, duplicate agent

### Критические security fixes

**1. Command Injection Prevention:**
```javascript
// ✅ SECURE: Use execFile with array args (no shell)
execFile('tmux', ['new-session', '-s', agentName, '-c', workDir]);

// ❌ VULNERABLE: exec with string interpolation
exec(`tmux new-session -s ${agentName} -c ${workDir}`);
```

**2. Error Sanitization:**
```javascript
class ErrorSanitizer {
  static sanitizeForUI(error) {
    return {
      id: crypto.randomUUID(),
      type: error.name,
      message: getUserMessage(error), // Safe message
      timestamp: Date.now()
    };
  }

  static sanitizeForLog(error, context) {
    return {
      ...sanitizeForUI(error),
      stack: redactPaths(error.stack),
      context: redactCredentials(context)
    };
  }
}
```

**3. Rate Limiting:**
```javascript
const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'second' });

if (!limiter.tryRemoveTokens(1)) {
  throw new RateLimitError('Event rate limit exceeded');
}
```

**4. Circuit Breaker:**
```javascript
const breaker = new CircuitBreaker('notifications', {
  failureThreshold: 3,
  timeout: 30000
});

await breaker.execute(async () => {
  return await api.sendNotification(message);
});
```

**5. Database Retry with Backoff:**
```javascript
class DatabaseRetryStrategy {
  async execute(operation) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (!isRetriable(error)) throw error;
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
    throw new DatabaseError('Max retries exceeded');
  }
}
```

### Edge Cases Coverage

- ✅ tmux session already exists
- ✅ SQLite database locked (WAL mode)
- ✅ Out of memory (LRU cache, memory checks)
- ✅ Renderer process crash (auto-restart)
- ✅ System sleep/wake (state recovery)
- ✅ tmux server crash (reconnection)
- ✅ Disk full (monitoring + warnings)
- ✅ PID collision (tracking)
- ✅ Orphaned processes (cleanup on exit)

### Graceful Degradation

- Context usage unavailable → show "N/A"
- HOOK.md parsing failed → continue without hook data
- Notification service down → queue for later
- SQLite write failed → write to fallback log

---

## 📊 Roles & Features

### MVP Roles (4 базовых)

| Role | Icon | Description | Use Case |
|------|------|-------------|----------|
| 🧠 **Architect** | Думающий агент | Планирование, design docs, архитектурные решения | Начало проекта, рефакторинг |
| 💻 **Coder** | Печатающий агент | Implementation, code writing, debugging | Основная разработка |
| 🧪 **Tester** | Проверяющий агент | Тесты, CI/CD, quality checks | Написание тестов, валидация |
| 🔍 **Reviewer** | Ищущий агент | Code review, validation, optimization | Проверка кода, finalization |

**Характеристики:**
- Плоская иерархия (без подчинения)
- Независимая работа (не координируются в MVP)
- Каждый на своём проекте

### MVP Features Checklist

```
✅ Spawn 4 типа агентов
✅ Визуальная карта с pixel sprites
✅ Hover → quick stats
✅ Click → detailed panel с чатом
✅ Live-терминал внутри панели
✅ Real-time метрики (health, context %, uptime)
✅ HOOK.md интеграция (текущая молекула)
✅ Сохранение состояния (persistent)
✅ Graceful error handling
✅ Анимации (idle/working/error)
✅ Sound effects (опционально)
```

---

## 🗺️ Backlog (Post-MVP)

### Feature Backlog

**#1: Агент-подхватчик (Handoff Agent)**
- Описание: Агент, который читает HOOK.md и доделывает за застрявшими
- Цель: Ночная работа без присмотра
- Сложность: High
- Статус: Под вопросом (нужен супер-контроль)

**#2: Context Handoff System**
- Описание: Кнопка для переброски контекста от Architect к Coder
- Features:
  - Preview-окно (видно что передаётся)
  - Plan → Code flow
  - История handoffs
- Сложность: Medium

**#3: История действий агента**
- Описание: Timeline что делал агент за последний час
- Не в MVP (выпилено из scope)

**#4: Autonomous Overnight Mode**
- Описание: Агенты работают ночью без присмотра
- Requires: Handoff Agent, advanced error recovery
- Риски: Low control, возможны ошибки

**#5: Telegram Integration**
- Описание: Уведомления о статусе агентов в Telegram
- Use case: Мониторинг на ходу

**#6: Multi-Project View**
- Описание: Несколько проектов на одной карте
- Визуализация связей между проектами

---

## 🔬 Research Plan (3 сессии)

### Session 1: Multi-Agent Frameworks (2 часа)

**Цель:** Понять паттерны оркестрации

**Исследовать:**
- CrewAI
- Microsoft AutoGen
- LangChain Multi-Agent
- BabyAGI

**Вопросы:**
1. Как передают контекст?
2. Паттерны коммуникации?
3. Error handling strategies?
4. Визуализация агентов?

**Deliverable:**
```
docs/research/01-multi-agent-frameworks.md
- Сравнительная таблица
- Best practices
- Применимость к Agent Colony
```

---

### Session 2: Pixel Game Engines (2 часа)

**Цель:** Выбрать engine для визуализации

**Исследовать:**
- Phaser.js
- PixiJS
- Kaboom.js
- Canvas API

**Критерии оценки:**
- FPS при 20+ sprites
- Bundle size
- React/Electron интеграция
- Developer experience

**Deliverable:**
```
docs/research/02-pixel-engines-comparison.md
- Benchmarks
- Пример кода
- Рекомендация
```

---

### Session 3: Process Management + Prototypes (3 часа)

**Цель:** Надёжное управление процессами

**Исследовать:**
- tmux automation
- blessed/blessed-contrib
- node-pty
- systeminformation

**Тестовые сценарии:**
- Spawn 5 агентов в tmux
- Детекция зависшего агента
- Recovery после перезагрузки
- Live-терминал в Electron

**Deliverable:**
```
docs/research/03-process-management.md
- tmux best practices
- Метрики detection
- Recovery mechanisms

.agent/prototypes/
├── phaser-demo/
├── pixi-demo/
├── tmux-manager/
```

---

## 📅 Implementation Roadmap

### Week 1-2: Core Infrastructure
- Electron app scaffold
- tmux process manager (с security fixes)
- SQLite persistence (WAL mode, retry strategy)
- Basic agent lifecycle (spawn, monitor, kill)

### Week 3-4: Visual Layer
- Pixel map rendering (выбранный engine)
- Agent sprites + animations (idle/working/error)
- UI panels (spawn modal, detail panel, chat)

### Week 5-6: Integration
- optimi-mac integration (HOOK.md, health checks)
- Metrics collection (context usage, activity)
- Error handling (circuit breakers, rate limiting)

### Week 7: Polish
- Юмористические статусы
- Sound effects (опционально)
- Testing (unit + chaos)
- Bug fixes

---

## ✅ Success Criteria

**MVP считается успешным если:**

1. ✅ Можно spawn 4 типа агентов (Architect, Coder, Tester, Reviewer)
2. ✅ Визуальная карта с анимированными pixel sprites
3. ✅ Hover показывает quick stats без лагов
4. ✅ Click открывает детальную панель с live-терминалом
5. ✅ Real-time метрики обновляются каждые 2-5 сек
6. ✅ HOOK.md integration работает (видно текущую молекулу)
7. ✅ Состояние сохраняется (можно закрыть/открыть app)
8. ✅ Graceful error handling (не падает при краше агента)
9. ✅ Security fixes применены (нет command injection)
10. ✅ Работает на macOS без sudo

**Quality bar:**
- FPS ≥ 30 при 10 агентах
- Memory usage < 500MB
- Context usage detection работает в 90% случаев
- Recovery после system sleep работает в 80% случаев

---

## 📚 References

**Inspiration:**
- RimWorld (colony management, top-down view)
- Михаил Ого МК (абсурдный юмор, pixel art)
- Oxygen Not Included (яркие цвета, простые анимации)

**Technical:**
- Electron Security Best Practices: https://www.electronjs.org/docs/latest/tutorial/security
- Node.js Child Process: https://nodejs.org/api/child_process.html
- tmux Automation: https://github.com/tmux/tmux/wiki
- Circuit Breaker Pattern: Martin Fowler

**AI Multi-Agent:**
- CrewAI: https://github.com/joaomdmoura/crewAI
- Microsoft AutoGen: https://microsoft.github.io/autogen/
- LangChain Multi-Agent: https://python.langchain.com/docs/use_cases/multi_agent

---

## 📝 Changelog

**v1.0 (2026-01-19):**
- Initial design approved
- Security review completed
- Research plan defined
- Implementation roadmap created

---

**Контакты:**
Design Owner: Claude Sonnet 4.5
Repository: optimi-mac
Session: 2026-01-19 Brainstorming
