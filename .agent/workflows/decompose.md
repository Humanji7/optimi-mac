# Decompose: MEOW-Style Task Breakdown

---
description: Разбивает задачу на атомарные Molecules с GUPP enforcement
---

// turbo-all

## Core Principles (из GasTown)

### MEOW — Molecular Expression of Work
Любая задача >3 файлов ДОЛЖНА быть разбита на Molecules (атомарные шаги).

### GUPP — Universal Propulsion Principle
> "Если на твоём Hook есть работа — ТЫ ОБЯЗАН её выполнить"

**Это НЕ рекомендация. Это ПРИНЦИП.**

### Hook — Персистентное состояние
Файл `.agent/HOOK.md` — твоя очередь работы. Он выживает краши, рестарты, handoff.

---

## Фаза 0: Check Hook (ОБЯЗАТЕЛЬНО ПЕРВЫМ!)

```bash
# ВСЕГДА проверяй Hook перед любой работой:
cat .agent/HOOK.md 2>/dev/null
```

**Если Hook существует и содержит CURRENT molecule:**
→ Следуй GUPP: выполни эту работу ПЕРВОЙ
→ Не начинай новую задачу, пока Hook не пуст

**Если Hook пуст или не существует:**
→ Продолжай к оценке новой задачи

---

## Фаза 1: Complexity Gate

```
┌─────────────────────────────────────────────────┐
│           COMPLEXITY ASSESSMENT                  │
├─────────────────────────────────────────────────┤
│ Files affected:                                  │
│   1-3   → SIMPLE: работай без Hook              │
│   4-7   → MEDIUM: создай Hook с 2-3 molecules   │
│   8+    → COMPLEX: обязательный Hook + handoff  │
├─────────────────────────────────────────────────┤
│ Estimated lines:                                 │
│   <200  → SIMPLE                                │
│   200-500 → MEDIUM                              │
│   500+  → COMPLEX                               │
├─────────────────────────────────────────────────┤
│ Cross-module dependencies:                       │
│   None  → можно параллельно                     │
│   Some  → строго последовательно                │
│   Many  → COMPLEX, нужен handoff план           │
└─────────────────────────────────────────────────┘
```

**Результат:** SIMPLE / MEDIUM / COMPLEX

---

## Фаза 2: Create Hook

Создай `.agent/HOOK.md`:

```markdown
# 🪝 HOOK: [краткое название задачи]

## GUPP Status: ACTIVE
> Если ты читаешь это — ТЫ ОБЯЗАН выполнить CURRENT molecule.

## Original Request
[Полный запрос пользователя]

## Complexity: [SIMPLE/MEDIUM/COMPLEX]
- Files: X
- Lines: ~Y
- Dependencies: [none/some/many]

---

## Molecules

### M1: [название] — CURRENT 🔴
**Scope:** [какие файлы]
**Steps:**
- [ ] Step 1.1
- [ ] Step 1.2
- [ ] Step 1.3
**Commit:** `feat: [описание]`
**Verification:** [как проверить]

### M2: [название] — PENDING ⚪
**Scope:** [какие файлы]
**Steps:**
- [ ] Step 2.1
- [ ] Step 2.2
**Commit:** `feat: [описание]`

### M3: [название] — PENDING ⚪
...

---

## Convoy Progress
- [ ] M1
- [ ] M2  
- [ ] M3
- [ ] VERIFICATION
- [ ] CLEANUP

## Handoff History
| Timestamp | Agent | Completed | Notes |
|-----------|-------|-----------|-------|
| [now]     | [me]  | -         | Created Hook |
```

---

## Фаза 3: Execute Molecules (GUPP Loop)

```
┌─────────────────────────────────────────────────┐
│              GUPP EXECUTION LOOP                 │
└─────────────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 1. Read HOOK.md         │
        │    Find CURRENT molecule │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 2. Announce:            │
        │ "Executing M[N]: [name]"│
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 3. Execute ONLY this    │
        │    molecule's steps     │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 4. Update HOOK.md:      │
        │    M[N] → DONE ✅        │
        │    M[N+1] → CURRENT 🔴   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 5. Commit:              │
        │ git commit -m "M[N]:..."│
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ 6. Self-check:          │
        │ Can I continue?         │
        └─────────────────────────┘
               │           │
          YES  │           │  NO (risk)
               ▼           ▼
        [Next molecule]  [/handoff]
```

---

## Фаза 4: /handoff Protocol

**Триггеры для handoff:**
- 10+ tool calls в сессии
- 5+ файлов изменено
- Ответ становится очень длинным
- "Ещё чуть-чуть и всё" — СТОП!

**Выполнение handoff:**

1. **Commit текущий прогресс:**
   ```bash
   git add .
   git commit -m "WIP: [molecule name] - handoff"
   ```

2. **Обновить HOOK.md:**
   ```markdown
   ## Handoff History
   | Timestamp | Agent | Completed | Notes |
   |-----------|-------|-----------|-------|
   | 2026-01-10 12:30 | opus | M1, M2 | Approaching limit |
   
   ## Handoff Note
   Остановился на: M3, step 2
   Причина: context limit approaching
   Next agent: продолжи с M3 step 2
   
   ## Resume Command
   "Читай .agent/HOOK.md и продолжи по GUPP"
   ```

3. **Сообщить пользователю:**
   ```
   ✅ Completed: M1, M2
   🔴 Current: M3 (step 2 of 4)
   ⚪ Pending: M4, M5
   
   Handoff готов. Скажи "Продолжи" в новом чате.
   ```

---

## Фаза 5: Completion

Когда все molecules DONE:

1. **Verification molecule** (обязательно):
   - Запусти тесты
   - Проверь билд
   - Smoke test функционала

2. **Cleanup:**
   ```bash
   # Архивируй Hook
   mv .agent/HOOK.md .agent/hooks/HOOK_$(date +%Y%m%d_%H%M).md
   git add . && git commit -m "chore: archive completed hook"
   ```

3. **Summary для пользователя:**
   ```
   ✅ Convoy completed!
   
   Molecules executed: 5
   Commits: 5
   Handoffs: 1
   
   Changes:
   - [list of changes]
   ```

---

## Commands Reference

| Команда | Действие |
|---------|----------|
| "Продолжи" | Читай HOOK.md, выполняй CURRENT molecule |
| "Статус" | Покажи прогресс Convoy |
| "Следующий" | Выполни только следующий molecule |
| "/handoff" | Сохрани прогресс, подготовь к передаче |
| "Декомпозиция: X" | Создай новый Hook для задачи X |

---

## GUPP Mantras

> "Hook есть? Работай. Hook пуст? Спроси."

> "Один molecule = один коммит. Всегда."

> "Handoff дёшев. Потеря контекста дорога."

> "Лучше 3 завершённых molecule, чем 1 брошенный convoy."
