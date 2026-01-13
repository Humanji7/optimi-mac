# 🪝 HOOK: Dashboard Tooltips & Documentation

**Status:** 🔴 ACTIVE
**Created:** 2026-01-13
**Goal:** Добавить прозрачность — тултипы с командами + документация

---

## Convoy

### M1: Documentation `docs/DASHBOARD_GUIDE.md` ✅
**Files:** `docs/DASHBOARD_GUIDE.md` (new)

Создать гайд со списком всех кнопок и их функций:

| Кнопка | Команда/Скрипт | Описание |
|--------|----------------|----------|
| 🔄 Refresh | `fetch('data.json')` | Перезагрузка данных |
| 🌙 Night Watch | `night-watch.sh` | Ночной рефакторинг |
| 📊 StatusLine | `install-statusline.sh` | Установка статуслайна |
| 🏗️ Setup AI | `setup-ai-infrastructure.sh` | Создание .agent/ |
| 🧪 Sandbox | `sandbox-test.sh` | Тест инфраструктуры |
| 🧠 Triage | `generate-triage-prompt.sh` | Анализ проекта |
| 📦 Setup (table) | `setup-ai-infrastructure.sh` | Быстрая установка |
| 🏥 Health Check | `projects-health-check.sh` | Сканирование проектов |

---

### M2: Data-атрибуты для тултипов ✅
**Files:** `.agent/dashboard/index.html`

Добавить `data-command` к кнопкам:
```html
<button id="refreshBtn" data-command="Reload data.json">🔄 Refresh</button>
<button id="nightWatchBtn" data-command="bash night-watch.sh [projects]">🌙 Night Watch</button>
...
```

Кнопки для обработки:
- Footer: refreshBtn, nightWatchBtn, statusLineBtn, setupAIBtn, sandboxBtn
- Dropdown: runHealthCheck, copyReport, openTerminal, nightWatchDryRun
- Table actions: Triage, Setup (динамические, через JS)

---

### M3: CSS + JS для тултипов ✅
**Files:** `.agent/dashboard/styles.css`, `.agent/dashboard/app.js`

CSS:
```css
[data-command]:hover::after {
    content: attr(data-command);
    position: absolute;
    /* styling */
}
```

JS для динамических кнопок (Triage в таблицах):
- При рендере добавлять `data-command` с реальной командой

---

### M4: Проверка в браузере ⬜
- Запустить дашборд
- Проверить тултипы на всех кнопках
- Скриншоты для подтверждения

---

## Current: M4
