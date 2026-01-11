# HANDOFF: Dashboard Integration

## Резюме обсуждения (2026-01-11)

**Основной вопрос:**  
Подхватит ли dashboard изменения в проектах после того, как LLM исправит проблемы?

✅ **Ответ:** Да, dashboard подхватывает изменения, НО требуется:
1. Перезапустить `projects-health-check.sh` для обновления `data.json`
2. Dashboard умеет auto-refresh каждые 30 сек (есть toggle в UI)

**Текущий workflow (работает):**
1. Dashboard показывает проблемы → юзер копирует промпт из `TRIAGE_QUICK_START.md`
2. LLM исправляет проблему в проекте
3. **Вручную запустить:** `bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh`
4. Dashboard автоматически подхватит обновлённый `data.json`

---

## Выводы

✅ **Copy-paste промптов — нормально** (не требует автоматизации UI)  
✅ **Dashboard как "панель управления"** — полезная идея (архивация, удаление, quick actions)  
❌ **Интеграция "кнопка → открыть чат с промптом"** — нереалистична без расширений VSCode/Cursor

---

## Next Steps

### Приоритет 1: Автоматизация data.json
**Задача:** Настроить cron для `projects-health-check.sh` каждые 5 минут.

```bash
# Добавить в crontab:
*/5 * * * * bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh
```

**Результат:** Dashboard всегда показывает актуальное состояние проектов.

---

### Приоритет 2: Dashboard как Control Panel (опционально)

**Фичи для следующей итерации:**
1. **Copy Prompt Button** — для каждого проекта в "Need Attention"
2. **Archive/Delete Project** — скрывать/удалять из мониторинга
3. **Quick Actions** — batch операции (fix all "No .agent/", commit all uncommitted)

**Усилие:** ~1-2 часа разработки UI + bash интеграции

---

## Files Reference

- Dashboard: `/Users/admin/projects/optimi-mac/.agent/dashboard/`
- Health check script: `/Users/admin/projects/optimi-mac/.agent/scripts/projects-health-check.sh`
- Triage prompts: `/Users/admin/projects/optimi-mac/.agent/prompts/TRIAGE_QUICK_START.md`
- Workflow: `/Users/admin/projects/optimi-mac/.agent/workflows/triage-project.md`

---

---

## ✅ COMPLETED (2026-01-11 13:19)

### GitHub Repository
- **URL:** https://github.com/Humanji7/optimi-mac
- **Branch:** `main`
- Все handoff/triage документы закоммичены и запушены

### Cron Automation (Приоритет 1 — выполнен)
```bash
*/5 * * * * bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh
```
Dashboard теперь автоматически получает свежие данные каждые 5 минут.

---

*Updated: 2026-01-11 13:19*

---

## ✅ COMPLETED (2026-01-11 14:38) — Triage + Archive

### Implemented Features

1. **🧠 AI Triage Prompt Generator**
   - Bash script: `.agent/scripts/generate-triage-prompt.sh`
   - Deep analysis: git status, HOOK.md, .agent/ structure
   - Dashboard button → copies command to clipboard
   - Toast notifications

2. **📦 Project Archive**
   - Hide projects from dashboard
   - localStorage storage
   - Collapsed "📦 Archived (N)" section with Restore

### Files Changed
- `generate-triage-prompt.sh` (NEW)
- `dashboard/app.js` (modified)
- `dashboard/styles.css` (modified)

### ⚠️ Known Issue: Projects Not Moving to Healthy

**Причина:** Health-check требует **чистый git** (no uncommitted changes).

**Решение:** После исправлений AI — нужен коммит:
```bash
cd ~/projects/<project>
git add . && git commit -m "fix: <message>"
bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh
```

### Verification Needed
- [ ] Manual browser testing of UI
- [ ] Test full workflow: Triage → AI fix → commit → move to Healthy

### Docs
- Walkthrough: `/Users/admin/.gemini/antigravity/brain/1323f3b9-76df-4cdb-993d-29d96cc75c00/walkthrough.md`

---
