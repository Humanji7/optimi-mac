# 🚀 Промпт для выполнения: Living Memory System

---

## Контекст

Завершён **Pivot #2** OPTIMI: из Research Lab → Living Memory System.

**Предыдущий план:** `/Users/admin/.gemini/antigravity/brain/0aa5412d-6d32-41f7-b52f-e1f901149df3/implementation_plan.md`

---

## Роль

Ты — **Execution Agent** для optimi-mac. Твоя задача — реализовать план трансформации из Research Lab в Living Memory System.

---

## Что нужно сделать

### Phase 1: Переименование структуры
```bash
# 1. Переименовать директорию
mv /Users/admin/projects/optimi-mac/docs/lab /Users/admin/projects/optimi-mac/docs/memory

# 2. Обновить index.md — заменить "Lab" на "Memory"
# 3. Удалить ненужные файлы:
#    - ops/experiment-backlog.md
#    - ops/experiment-roadmap.md  
#    - ops/dissemination-strategy.md
```

### Phase 2: Создание Error Journal
```
1. Создать /docs/memory/journal/index.md — инструкция по логированию
2. Создать /docs/memory/journal/2026-01.md — первые записи
3. Добавить 5 реальных ошибок из недавних сессий:
   - Railway deployment (Point-G)
   - KLYAP watermark removal
   - Memory/context loss examples
   - Любые другие из conversation history
```

**Формат записи:**
```markdown
## ERR-XXX: [Название]

**Дата:** YYYY-MM-DD
**Проект:** [имя проекта]
**Агент:** Claude Code / Cursor / Antigravity

**Что случилось:**
[Краткое описание]

**Почему:**
[Root cause]

**Урок:**
[Что запомнить]

**Tags:** #тег1 #тег2
```

### Phase 3: Dashboard Integration
```
1. Найти ~/.agent/dashboard/index.html
2. Добавить кнопку "📝 Log Error" в footer
3. Создать ~/.agent/scripts/log-error.sh
```

---

## Ключевые документы

1. **План:** [implementation_plan.md](file:///Users/admin/.gemini/antigravity/brain/0aa5412d-6d32-41f7-b52f-e1f901149df3/implementation_plan.md)
2. **Текущая структура:** `/docs/lab/` (будет `/docs/memory/`)
3. **Dashboard:** `~/.agent/dashboard/`

---

## Принципы

- **Практичность > теория:** это инструмент, не исследование
- **Реальные данные:** записи из реальных сессий, не абстрактные примеры
- **Минимализм:** не усложняй структуру

---

## Проверка успеха

После выполнения:
1. `/docs/memory/` существует и работает
2. Error Journal содержит 5+ реальных записей
3. Dashboard показывает кнопку "Log Error"

---

## Начни с

```bash
# Проверь текущую структуру
ls -la /Users/admin/projects/optimi-mac/docs/lab/

# Прочитай план
cat /Users/admin/.gemini/antigravity/brain/0aa5412d-6d32-41f7-b52f-e1f901149df3/implementation_plan.md
```

---

*Created: 2026-01-15*
