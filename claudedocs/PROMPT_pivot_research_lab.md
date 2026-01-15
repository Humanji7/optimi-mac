# 🔬 Промпт для пивота: OPTIMI → Исследовательская Лаборатория

---

## Контекст пивота

**Было:** B2B SaaS продукт для разработчиков с целью привлечения инвестиций ($500K pre-seed)

**Стало:** Персональная исследовательская лаборатория по AI Memory и Context Intelligence

**Формат:**
- 1 исследователь-лаборант (ты)
- N AI-агентов как "сотрудники лаборатории"
- Фокус на эксперименты, публикации, open source

---

## Роль

Ты — **редактор-стратег**, который переписывает документацию стартапа в документацию исследовательской лаборатории. Сохраняй техническую глубину, убирай startup/investor framing.

---

## Принципы трансформации

### Что меняем

| Было (Startup) | Стало (Lab) |
|----------------|-------------|
| Инвесторы как аудитория | Исследовательское сообщество |
| Revenue, ARR, MRR | Эксперименты, публикации, artifacts |
| Customers, users | Я сам + open source community |
| Product-Market Fit | Research questions & hypotheses |
| GTM Strategy | Experiment roadmap |
| Competitive moat | Novel contributions |
| Unit economics | Resource budget (API costs, compute) |
| Team hiring | Agent orchestration |
| Enterprise features | Extensibility, reproducibility |

### Что сохраняем

- Техническую архитектуру (8 слоёв контекста)
- Исследования по LLM Memory
- Код и implementation patterns
- Философию "AI с памятью"

---

## Задание по документам

Перепиши каждый документ согласно новому framing:

### 1. `research_llm_memory_20260115.md`
**Действие:** Оставить как есть — это уже research document
**Добавить:** 
- Секцию "Research Gaps to Explore"
- Приоритизацию для лаборатории

---

### 2. `memory_integration_battle_plan.md`
**Было:** План интеграции в 5 продуктов optimi-mac
**Стало:** "Experiment Backlog" — список экспериментов для лаборатории

**Структура:**
```markdown
# 🧪 Lab Experiment Backlog

## Experiment Categories
1. Memory Architectures (A-MEM, Mem0, custom)
2. Context Aggregation (layers, fusion strategies)
3. Agent Memory Sharing (multi-agent scenarios)
4. Evaluation Methods (benchmarks, metrics)

## Active Experiments
[Канбан-стиль: Backlog → In Progress → Done]

## Experiment Template
- Hypothesis
- Method
- Expected outcome
- Resources needed
- Agent assignments
```

---

### 3. `context_intelligence_engine.md`
**Было:** Product architecture doc
**Стало:** "Research Architecture" — референсная архитектура для экспериментов

**Изменения:**
- Убрать product framing ("user", "customer")
- Добавить "Experiment Hooks" — точки для вариаций
- Добавить "Measurement Points" — где собирать метрики
- Переименовать в "Context Intelligence Reference Architecture"

---

### 4. `investor_pitch_optimi_memory.md`
**Было:** Investor pitch
**Стало:** "Lab Manifesto" — миссия и vision лаборатории

**Структура:**
```markdown
# 🔬 OPTIMI Lab Manifesto

## Mission
Исследовать и создавать системы долгосрочной памяти для AI-агентов.

## Core Beliefs
- AI без памяти — это калькулятор
- Context = Quality of reasoning
- Agents need persistent identity

## Research Pillars
1. Memory Architectures
2. Context Orchestration  
3. Agent Cognition
4. Human-Agent Collaboration

## Lab Principles
- Open research (публикуем всё)
- Reproducible experiments
- Agent-first development
- Personal use as primary validation

## Success Metrics (не revenue)
- Papers/posts published
- Experiments completed
- Open source contributions
- Personal productivity gain
```

---

### 5. `investor_one_pager.md`
**Было:** Краткая сводка для инвестора
**Стало:** "Lab Overview" — одностраничник о лаборатории

**Для кого:** Потенциальные коллабораторы, open source contributors, блог-читатели

---

### 6. `investor_faq.md`
**Было:** Q&A для инвесторов
**Стало:** "Lab FAQ" — вопросы о лаборатории

**Темы:**
- Зачем это? (personal research, learning)
- Как устроена работа с агентами?
- Какие tools используются?
- Как присоединиться / contribute?
- Что публикуется open source?

---

### 7. `competitive_analysis.md`
**Было:** Конкурентный анализ для позиционирования
**Стало:** "Related Work" — обзор смежных проектов для research context

**Фокус:**
- Не "как победить", а "чему научиться"
- Gaps in existing solutions → research opportunities
- Collaboration possibilities

---

### 8. `financial_model.md`
**Было:** Revenue projections, unit economics
**Стало:** "Lab Resource Model" — бюджет эксперимента

**Структура:**
```markdown
# 💰 Lab Resource Model

## Monthly Budget
| Resource | Cost | Purpose |
|----------|------|---------|
| OpenAI API | $50 | Embeddings, LLM calls |
| Anthropic API | $100 | Claude for agents |
| Compute (local) | $0 | M1 Mac |
| Vector DB (Qdrant Cloud) | $25 | If needed |
| Total | ~$175/month |

## Cost Per Experiment
- Small (1 week): ~$20
- Medium (1 month): ~$100
- Large (3 months): ~$300

## Sustainability
- Personal budget: self-funded
- Future: grants, sponsorships, consulting
```

---

### 9. `gtm_strategy.md`
**Было:** Go-to-Market для привлечения пользователей
**Стало:** "Dissemination Strategy" — как делиться результатами

**Структура:**
```markdown
# 📢 Lab Dissemination Strategy

## Channels
1. **Blog/Substack** — эссе о research findings
2. **GitHub** — open source tools, experiments
3. **Twitter/X** — короткие insights, threads
4. **Papers** — формальные публикации (arXiv)

## Content Types
- Experiment reports (what worked, what didn't)
- Tool releases (code + docs)
- Tutorials (how to replicate)
- Thoughts/essays (big picture)

## Cadence
- Weekly: 1 short insight
- Monthly: 1 experiment report
- Quarterly: 1 tool release
```

---

### 10. `implementation_roadmap.md`
**Было:** Product development timeline
**Стало:** "Experiment Roadmap" — план исследований

**Структура:**
```markdown
# 🗺️ Lab Experiment Roadmap

## Phase 1: Foundation (Weeks 1-4)
- Set up lab infrastructure
- First memory experiment (Mem0 vs Chroma)
- Document baseline metrics

## Phase 2: Core Research (Weeks 5-12)
- Context layer experiments
- Agent memory sharing
- Publish first findings

## Phase 3: Synthesis (Weeks 13-20)
- Build reference implementation
- Write comprehensive guide
- Open source release

## Success = Learning, not shipping
```

---

## Новые документы для создания

### 11. `LAB_README.md`
Главный README лаборатории — что это, зачем, как устроено

### 12. `AGENTS.md`
Описание AI-агентов лаборатории:
- Их роли
- Specializations
- Communication protocols
- Memory sharing

### 13. `EXPERIMENTS.md`
Журнал экспериментов (lab notebook):
- Дата, гипотеза, результат, learnings

### 14. `PUBLICATIONS.md`
Трекер публикаций:
- Blog posts
- GitHub repos
- Papers
- Talks

---

## Формат работы

1. Читаешь исходный документ
2. Применяешь трансформацию согласно таблице
3. Сохраняешь техническую суть
4. Убираешь startup/investor язык
5. Добавляешь research/lab framing
6. Выводишь обновлённый документ

---

## Тон и стиль

**Было:** Pitch mode (убедить, продать, impress)
**Стало:** Lab mode (объяснить, задокументировать, поделиться)

- Честность вместо hype
- "Мы исследуем" вместо "Мы решаем"
- "Возможно" вместо "Гарантируем"
- Первое лицо единственное число (я исследую, я пробую)

---

## Начни работу

Прочитай все документы в `/Users/admin/projects/optimi-mac/claudedocs/` и трансформируй их согласно инструкциям выше. Начни с `investor_pitch_optimi_memory.md` → `LAB_MANIFESTO.md`.
