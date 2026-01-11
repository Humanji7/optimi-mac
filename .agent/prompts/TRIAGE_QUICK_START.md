# Dashboard Triage — Quick Start

Из dashboard видно проблемы → как исправить за 30 секунд.

---

## Текущая картина

```json
{
  "total": 11,
  "withAgent": 6,
  "activeHooks": 0,
  "uncommitted": 7,
  "noGit": 2
}
```

**Need Attention (10 проектов):**
1. Parsertang: No .agent/, Uncommitted
2. bip-buddy: Uncommitted
3. extra-vibe: No .agent/, No git
4. optimi-mac: Uncommitted
5. personal-site: Uncommitted
6. pointg: Uncommitted
7. reelstudio: No .agent/, Uncommitted
8. sphere-777: No .agent/
9. tg-tr-7: No git
10. vob: No .agent/, Uncommitted

---

## Quick Copy-Paste Prompts

### Пример 1: sphere-777 (No .agent/)

```
Проект: sphere-777
Проблема: Нет .agent/ инфраструктуры

Задача:
1. Инициализируй .agent/ структуру через /setup-ai-pipeline
2. Убедись что создан CLAUDE.md с ссылкой на ~/.agent/GUPP.md
3. Заверши коммитом: "chore: init .agent/ infrastructure"
```

### Пример 2: bip-buddy (Uncommitted)

```
Проект: bip-buddy
Проблема: Uncommitted changes

Задача:
1. Покажи git status и git diff --stat
2. Объясни что изменено (1-2 строки)
3. Рекомендация: коммитить / ревью / откат
4. Если safe → сделай коммит с осмысленным message
```

### Пример 3: tg-tr-7 (No git)

```
Проект: tg-tr-7
Проблема: Нет git репозитория

Задача:
1. Проверь что проект не временный (покажи ls -la)
2. Инициализируй git: git init
3. Создай .gitignore если нужен
4. Сделай initial commit
```

### Пример 4: Batch Auto-Fix (все safe issues сразу)

```
Dashboard показывает 10 проектов Need Attention.

Auto-fix safe issues:

No git (2):
- extra-vibe
- tg-tr-7

No .agent/ (5):
- Parsertang, extra-vibe, reelstudio, sphere-777, vob

План:
1. Fix "No git" → git init + initial commit
2. Fix "No .agent/" → /setup-ai-pipeline
3. Uncommitted (7 проектов) оставить для ревью

Начинай.
```

---

## Использование через workflow

```
/triage-project sphere-777
```

Агент автоматически:
1. Прочитает data.json
2. Найдёт проблемы для sphere-777
3. Применит fix или спросит подтверждения

---

## Files Reference

- **Workflow:** `.agent/workflows/triage-project.md`
- **Prompts:** `.agent/prompts/triage-prompts.md`
- **Dashboard data:** `.agent/dashboard/data.json`

---

*Quick Start v1.0*
