# Multi-Agent Frameworks Research

**Date:** 2026-01-19
**Project:** Agent Colony
**Purpose:** Изучение архитектурных паттернов оркестрации AI-агентов

---

## Executive Summary

Изучены 4 ведущих multi-agent фреймворка: **CrewAI**, **Microsoft AutoGen**, **LangChain/LangGraph**, **BabyAGI**.

**Главный вывод:** Для Agent Colony оптимально **заимствовать паттерны**, но реализовать **native TypeScript оркестратор** для Electron. Причины:
1. Все фреймворки Python-first → нужен IPC bridge для Electron
2. Визуализация везде dashboard-style → RTS UI нужно строить с нуля
3. Контроль над lifecycle важнее готовых абстракций

---

## Сравнительная таблица

| Критерий | CrewAI | AutoGen | LangGraph | BabyAGI |
|----------|--------|---------|-----------|---------|
| **Язык** | Python | Python/.NET | Python/JS | Python |
| **Архитектура** | Agent/Task/Crew | ConversableAgent + GroupChat | StateGraph (DAG) | Task Queue Loop |
| **Паттерн оркестрации** | Sequential / Hierarchical | GroupChat / GraphFlow | Graph Nodes + Edges | Execute → Create → Prioritize |
| **Context Sharing** | 4-layer Memory System | Message History + Session | State with Reducers | Vector DB (embeddings) |
| **Error Handling** | State recovery, retry | Weak (needs custom) | Checkpointing | Logging only |
| **Визуализация** | Dashboards (SigNoz, AgentOps) | AutoGen Studio | LangGraph Studio | CLI / Community UI |
| **Real-time Streaming** | Partial | Partial | Full support | No |
| **TypeScript Support** | No | No | Yes (LangGraphJS) | No |
| **Production Ready** | Yes | Merging to Agent Framework | Yes | No |
| **RTS UI Fit** | Low (dashboards only) | Medium (Studio) | Medium (Studio) | Low |

---

## Детальный анализ по фреймворкам

### CrewAI

**Сильные стороны:**
- Зрелая архитектура (4000+ code snippets, production-ready)
- 4-layer Memory System (short-term, long-term, entity, contextual)
- Agent-to-Agent delegation встроено
- Богатая экосистема observability (SigNoz, AgentOps, MLflow)

**Слабые стороны:**
- Python-only (нужен IPC для Electron)
- Нет RTS-визуализации (только метрики)
- Heavyweight для простых случаев

**Применимые паттерны для Agent Colony:**
```
✅ Agent = Role + Goal + Backstory
✅ Task = Description + Expected Output + Agent Assignment
✅ Delegation = Agent может попросить другого агента
✅ 4-layer Memory = Short/Long/Entity/Contextual
```

---

### Microsoft AutoGen

**Сильные стороны:**
- GraphFlow (v0.4) = отличный паттерн для RTS workflow
- AutoGen Studio = visual debugging
- State persistence (save/load state)
- AgentOps интеграция для real-time metrics

**Слабые стороны:**
- В режиме maintenance (мигрирует в Agent Framework)
- Слабый error handling (unhandled exceptions игнорируются)
- GroupChatManager добавляет latency

**Применимые паттерны для Agent Colony:**
```
✅ GraphFlow = Sequential + Parallel + Conditional + Loops
✅ activation="all"/"any" = гибкие условия активации
✅ AgentOps API = live metrics для RTS dashboard
✅ save_state()/load_state() = persistence
```

---

### LangChain/LangGraph

**Сильные стороны:**
- **LangGraphJS** = TypeScript-first (идеально для Electron!)
- Explicit state management через reducers
- Built-in checkpointing для fault-tolerance
- LangGraph Studio = real-time execution visualization
- Full streaming support

**Слабые стороны:**
- Тяжёлая зависимость от LangChain ecosystem
- Overhead для простых случаев
- Learning curve (Command pattern, reducers)

**Применимые паттерны для Agent Colony:**
```
✅ StateGraph = nodes + edges architecture
✅ Command({ goto, update }) = явная маршрутизация
✅ Reducers = merge strategy для parallel execution
✅ Checkpointing = recovery после сбоев
✅ Streaming = real-time updates для UI
```

---

### BabyAGI

**Сильные стороны:**
- Минимализм (105 строк оригинала)
- Task Queue + Prioritization = простая концепция
- Vector Memory для semantic context
- Decorator-based function registry (BabyAGI 2o)

**Слабые стороны:**
- Нет параллелизма (sequential execution)
- Нет error recovery (только logging)
- Нет resource limits (риск runaway tasks)
- Single-agent model

**Применимые паттерны для Agent Colony:**
```
✅ Task Queue + Prioritization loop
✅ Vector Memory для shared context
✅ Execute → Create New Tasks → Reprioritize cycle
✅ Decorator pattern для agent capabilities
```

---

## Рекомендации для Agent Colony

### Архитектурные паттерны (ВЗЯТЬ):

**1. От CrewAI:**
```typescript
interface Agent {
  id: string;
  role: "Architect" | "Coder" | "Tester" | "Reviewer";
  goal: string;
  capabilities: string[];
  memory: AgentMemory;
  allowDelegation: boolean;
}

interface AgentMemory {
  shortTerm: Message[];        // Текущая сессия
  longTerm: Fact[];            // Между сессиями
  contextual: Context[];       // Релевантный контекст
}
```

**2. От LangGraph:**
```typescript
// State management with reducers
interface ColonyState {
  agents: Map<AgentId, Agent>;
  tasks: Task[];
  messages: Message[];
}

const stateReducer = {
  messages: (old, new) => [...old, ...new],  // Append
  agents: (old, new) => new Map([...old, ...new]),  // Merge
  tasks: (old, new) => mergeTasks(old, new)  // Custom logic
};

// Explicit routing with Command pattern
return {
  goto: selectNextAgent(state),
  update: { messages: [response] }
};
```

**3. От AutoGen:**
```typescript
// GraphFlow patterns
type ActivationMode = "all" | "any";

interface WorkflowNode {
  id: string;
  agent: Agent;
  activation: ActivationMode;
  edges: { target: string; condition?: string }[];
}

// Parallel execution
const parallelTasks = graph.getReadyNodes().map(node =>
  node.agent.execute(state)
);
await Promise.allSettled(parallelTasks);
```

**4. От BabyAGI:**
```typescript
// Task prioritization loop
class TaskOrchestrator {
  async tick() {
    const task = this.queue.pop();
    const result = await this.execute(task);

    const newTasks = this.createTasks(result);
    this.queue.push(...newTasks);

    await this.reprioritize();
    this.updateVisualization();
  }

  async reprioritize() {
    // LLM-driven или rule-based
    this.queue.sort((a, b) =>
      this.calculatePriority(b) - this.calculatePriority(a)
    );
  }
}
```

### Визуализация (НЕ БРАТЬ из фреймворков):

Все фреймворки предлагают **dashboard-style** визуализацию:
- Графики метрик
- Execution traces
- Debug panels

**Для RTS-стиля Agent Colony** нужен custom UI:
- Pixel art агенты на карте
- Real-time анимации
- Hover/click интерактивность
- Game-like controls

### Рекомендуемый подход:

```
┌─────────────────────────────────────────────────┐
│                 Agent Colony                    │
├─────────────────────────────────────────────────┤
│  Electron App (TypeScript)                      │
│  ├─ React + Canvas/PixiJS (RTS Visualization)  │
│  ├─ Native Orchestrator (patterns from above)   │
│  ├─ tmux Process Manager                        │
│  └─ SQLite Persistence                          │
└─────────────────────────────────────────────────┘

НЕ ИСПОЛЬЗОВАТЬ:
- Python фреймворки как backend (избыточный IPC)
- Готовые визуализации (не RTS-style)
- Full LangChain dependency (overkill)

ИСПОЛЬЗОВАТЬ:
- Паттерны Agent/Task/Memory от CrewAI
- StateGraph + Reducers от LangGraph
- GraphFlow patterns от AutoGen
- Task Queue + Prioritization от BabyAGI
```

---

## Итоговая архитектура для Agent Colony

```typescript
// Гибрид лучших паттернов

interface AgentColony {
  // CrewAI-style agents
  agents: Map<AgentId, Agent>;

  // BabyAGI-style task queue
  taskQueue: PriorityQueue<Task>;

  // LangGraph-style state
  state: ColonyState;
  stateReducer: StateReducer;

  // AutoGen-style workflow
  workflow: WorkflowGraph;

  // Custom for RTS
  visualization: PixelMapRenderer;

  async orchestrate() {
    while (this.hasWork()) {
      // 1. Get ready tasks (AutoGen activation patterns)
      const readyTasks = this.workflow.getReadyNodes(this.state);

      // 2. Execute in parallel
      const results = await Promise.allSettled(
        readyTasks.map(t => this.executeTask(t))
      );

      // 3. Update state (LangGraph reducers)
      this.state = this.stateReducer(this.state, results);

      // 4. Create new tasks (BabyAGI pattern)
      const newTasks = this.createTasks(results);
      this.taskQueue.push(...newTasks);

      // 5. Reprioritize (BabyAGI pattern)
      await this.reprioritize();

      // 6. Checkpoint (LangGraph pattern)
      await this.checkpoint();

      // 7. Update RTS visualization
      this.visualization.update(this.state);
    }
  }
}
```

---

## Открытые вопросы

1. **LangGraphJS integration?** — Возможно использовать как lightweight orchestration layer
2. **Vector DB для shared memory?** — Pinecone/Chroma vs simple SQLite?
3. **WebSocket streaming** — Для real-time RTS updates

---

## Sources

### CrewAI
- https://github.com/crewAIInc/crewAI
- https://docs.crewai.com/
- https://www.crewai.com/

### Microsoft AutoGen
- https://github.com/microsoft/autogen
- https://microsoft.github.io/autogen/
- https://learn.microsoft.com/en-us/agent-framework/

### LangGraph
- https://github.com/langchain-ai/langgraph
- https://github.com/langchain-ai/langgraphjs
- https://docs.langchain.com/oss/python/langgraph/

### BabyAGI
- https://github.com/yoheinakajima/babyagi
- https://github.com/yoheinakajima/babyagi-2o
- https://babyagi.org/

---

**Status:** ✅ Complete
**Next:** M2 - Pixel Game Engines Research
