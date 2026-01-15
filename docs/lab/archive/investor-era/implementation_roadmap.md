# 🛠️ Implementation Roadmap: OPTIMI Memory System

**От исследования к MVP за 10 недель**

---

## Overview

Этот документ переводит investor materials в конкретный план разработки.

**Цель MVP:** Работающий прототип с 5/8 слоями контекста, демонстрирующий core value proposition.

---

## Phase 1: Foundation (Недели 1-2)

### Week 1: Infrastructure Setup

- [ ] **Установить Chroma DB**
  - `npm install chromadb`
  - Создать `.agent/memory/` структуру
  - Тест: сохранить и найти 100 embeddings

- [ ] **Настроить embedding pipeline**
  - OpenAI text-embedding-3-small
  - Wrapper для батчинга
  - Кэширование для экономии

- [ ] **Создать memory-service.js**
  - `addMemory(type, content, metadata)`
  - `searchMemory(query, filters, limit)`
  - `updateMemory(id, updates)`

### Week 2: Layer 1 & 2

- [ ] **Layer 1: Code Structure**
  - Парсинг AST (babel/parser)
  - Complexity metrics (cyclomatic)
  - Pattern detection (duplications)

- [ ] **Layer 2: Git History**
  - Churn analysis (commits/file)
  - Hotspot detection
  - Temporal coupling

- [ ] **Integration test**
  - Прогнать на реальном проекте
  - Убедиться что данные корректны

---

## Phase 2: Memory Core (Недели 3-4)

### Week 3: Layer 3 — Refactoring Memory

- [ ] **Schema для рефакторингов**
  ```javascript
  {
    id, project, timestamp,
    before: { files, issues, complexity },
    changes: { strategy, prompts },
    after: { tests_passed, complexity, reverted },
    outcome: { success, user_feedback }
  }
  ```

- [ ] **Memory storage**
  - Сохранение после каждого рефакторинга
  - Linking связанных memories (A-MEM style)

- [ ] **Similarity search**
  - Найти похожие рефакторинги
  - Показать outcomes

### Week 4: Layer 4 & 5

- [ ] **Layer 4: Dependencies**
  - Import/export analysis
  - Blast radius calculation
  - Coupling metrics

- [ ] **Layer 5: Test Context**
  - Coverage parsing (c8/nyc)
  - Flaky test detection
  - Gap identification

---

## Phase 3: Intelligence (Недели 5-7)

### Week 5: Context Orchestrator

- [ ] **Параллельный сбор контекста**
  ```javascript
  const context = await Promise.all([
    getCodeContext(file),
    getGitContext(file),
    getMemoryContext(file),
    getDepsContext(file),
    getTestContext(file)
  ]);
  ```

- [ ] **Context quality scoring**
  - Completeness (5/5 layers)
  - Freshness (data age)
  - Confidence (per layer)

### Week 6: Diagnostic Engine

- [ ] **Risk assessment**
  - Multi-layer risk calculation
  - Threshold-based alerts

- [ ] **Strategy selection**
  - Match current state to successful past cases
  - Rank strategies by success rate

- [ ] **Reasoning chain**
  - Step-by-step logic
  - Evidence from each layer

### Week 7: Recommendations

- [ ] **Recommendation generator**
  - Contextual suggestions
  - Expected outcomes
  - Risk mitigation

- [ ] **XAI output**
  - "Why this recommendation"
  - Confidence breakdown
  - Alternative strategies

---

## Phase 4: Integration (Недели 8-9)

### Week 8: CLI Integration

- [ ] **Enhance night-watch.sh**
  - `--show-similar` flag
  - `--with-context` flag
  - Memory-aware planning

- [ ] **Enhance triage script**
  - Contextual prompt generation
  - Historical case matching

- [ ] **Enhance health-check**
  - Store snapshots in memory
  - Predictive alerts

### Week 9: Dashboard Integration

- [ ] **AI Insights panel**
  - Risk predictions
  - Similar cases
  - Recommendations

- [ ] **Memory visualization**
  - Timeline view
  - Pattern highlights

---

## Phase 5: Polish (Неделя 10)

### Week 10: MVP Completion

- [ ] **Testing**
  - Unit tests for memory service
  - Integration tests for full flow
  - Manual testing on 3+ projects

- [ ] **Documentation**
  - README updates
  - Usage examples
  - API documentation

- [ ] **Demo preparation**
  - 3 demo scenarios
  - Recorded walkthrough
  - Live demo script

---

## Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Vector DB | Chroma (embedded) |
| Embeddings | OpenAI text-embedding-3-small |
| AST Parser | @babel/parser |
| Git Analysis | simple-git |
| Coverage | c8 / nyc |
| Deps Analysis | madge |

---

## Success Criteria

### MVP Definition of Done

- [ ] 5/8 layers collecting data
- [ ] Memory persisting across sessions
- [ ] Similarity search working (<100ms)
- [ ] At least 1 "wow moment" in demo
- [ ] 3 beta users testing

### Metrics to Validate

| Metric | Target |
|--------|--------|
| Context gathering time | <5s |
| Similarity search latency | <100ms |
| Recommendation relevance | >70% |
| User "wow" reaction | 3/3 demos |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Chroma performance at scale | Start with <10K memories, monitor |
| Embedding costs | Batch, cache, use small model |
| Context quality varies | Fallback to available layers |
| Integration complexity | Start with CLI, add UI later |

---

## Next Steps After MVP

1. **Add remaining layers** (6, 7, 8)
2. **Beta program** with 50 users
3. **Iterate on feedback**
4. **Prepare for Product Hunt launch**
