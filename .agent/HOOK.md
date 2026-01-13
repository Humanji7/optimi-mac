# HOOK: Sandbox Status в таблицах дашборда

**Status:** 🔴 ACTIVE
**Created:** 2026-01-13
**Goal:** Показывать статус sandbox-тестов в таблицах проектов

---

## Convoy

| # | Molecule | Status | Files |
|---|----------|--------|-------|
| M1 | Колонка "Sandbox" в HTML таблицах | 🔴 CURRENT | `index.html` |
| M2 | Стили для статус-бейджей | ⚪ PENDING | `styles.css` |
| M3 | Логика отображения статуса | ⚪ PENDING | `app.js` |
| M4 | Запись результата после теста | ⚪ PENDING | `app.js` |

---

## Data Structure

```json
// localStorage key: "sandboxResults"
{
  "optimi-mac": { "status": "passed", "mode": "lint", "date": "2026-01-13" },
  "bip-buddy": { "status": "failed", "mode": "smoke", "date": "2026-01-12" }
}
```

## UI Spec

| Status | Badge |
|--------|-------|
| Lint passed | `✅ Lint` |
| Smoke passed | `✅ Smoke` |
| Failed | `❌ Failed` |
| Not tested | `—` |

---

## Progress Log

- [ ] M1: Add Sandbox column to tables
- [ ] M2: Add badge styles
- [ ] M3: Render status from localStorage
- [ ] M4: Save result on test run
