# HOOK: Agent Colony - Phase 3 Testing & Polish

**Status:** 🔴 ACTIVE
**Created:** 2026-01-20
**Type:** Testing & QA Convoy
**Project:** Agent Colony

---

## 📋 Context Summary

**Предыдущие фазы:**
- Phase 1 (Core Infrastructure) ✅ — Electron + tmux + SQLite + AgentManager
- Phase 2 (Visual Layer) ✅ — PixiJS + Sprites + Spawn Modal + Detail Panel

**Текущая задача:** Ручное тестирование и исправление багов

---

## 🚀 Molecules

### M9: Manual Testing ⬅️ CURRENT

**Goal:** Протестировать приложение вручную, найти баги

**Checklist:**
- [ ] Запустить `pnpm dev` — приложение стартует без ошибок
- [ ] Проверить canvas — тёмный фон рендерится
- [ ] Spawn Architect — появляется спрайт на canvas
- [ ] Spawn Coder — появляется спрайт
- [ ] Spawn Tester — появляется спрайт
- [ ] Spawn Reviewer — появляется спрайт
- [ ] Клик на агента — открывается Detail Panel
- [ ] Detail Panel показывает корректные данные
- [ ] Kill agent — агент удаляется с canvas
- [ ] Send command — команда отправляется (проверить logs)
- [ ] Закрыть app — graceful shutdown без ошибок
- [ ] Перезапустить app — агенты восстанавливаются из DB

**Bug Report Template:**
```
BUG-XXX: [Краткое описание]
- Steps to reproduce:
- Expected:
- Actual:
- Severity: Critical/High/Medium/Low
```

---

### M10: Bug Fixes

**Tasks:** Исправить баги найденные в M9

---

### M11: Error Handling

**Tasks:**
- [ ] UI feedback при ошибках spawn
- [ ] Обработка tmux not found
- [ ] Loading states

---

### M12: UI Polish

**Tasks:**
- [ ] Keyboard shortcuts (Esc)
- [ ] Улучшить стили
- [ ] Tooltips

---

## 📊 Progress

| Molecule | Status |
|----------|--------|
| M9: Manual Testing | 🔴 CURRENT |
| M10: Bug Fixes | ⚪ PENDING |
| M11: Error Handling | ⚪ PENDING |
| M12: UI Polish | ⚪ PENDING |

---

## 🔧 Quick Commands

```bash
cd /Users/admin/projects/optimi-mac/agent-colony
pnpm dev          # Development
pnpm type-check   # TypeScript check
pnpm build        # Production build
```

---

**Last Updated:** 2026-01-20
