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
- [x] Запустить `pnpm dev` — приложение стартует без ошибок
- [x] Проверить canvas — тёмный фон рендерится
- [x] Spawn Architect — работает ✅
- [x] Spawn Coder — появляется спрайт ✅
- [x] Spawn Tester — появляется спрайт ✅
- [x] Spawn Reviewer — появляется спрайт ✅
- [x] Клик на агента — открывается Detail Panel ✅
- [x] Detail Panel показывает корректные данные ✅
- [x] Kill agent — агент удаляется с canvas ✅
- [x] Send command — команда отправляется ✅
- [ ] Закрыть app — graceful shutdown без ошибок
- [ ] Перезапустить app — агенты восстанавливаются из DB

---

## 🐛 Known Bugs

### BUG-001: Spawn Agent не работает
- **Status:** FIXED ✅
- **Root cause:** React.StrictMode + PixiJS = WebGL context corruption
- **Fix:** Disabled StrictMode in index.tsx (pixi-react issue #602)

### BUG-002: Kill не удаляет спрайт
- **Status:** FIXED ✅
- **Fix:** Added agent:killed listener in PixiCanvas.tsx

### BUG-003: Send command crash (undefined properties)
- **Status:** FIXED ✅
- **Fix:** Optional chaining + merge updates with existing data

---

## ✅ Completed This Session

1. **Fixed UI click issues** — `useCallback` для handleAppReady/handleAgentClick
2. **Fixed event listener cleanup** — `return unsubscribe()` в useEffect
3. **Fixed PixiJS resizeTo** — changed from `window` to `container`
4. **Added folder picker** — Browse button with native dialog
5. **Added View menu** — DevTools toggle
6. **Increased modal z-index** — 10000
7. **Fixed BUG-001: Spawn Agent** — PixiJS 8.x Graphics API fix (chaining)
8. **Added debug IPC** — debugLog для логирования renderer в main process

**Commits:**
- `31dc594` - fix: UI click issues + event listener cleanup + folder picker
- `1a122d0` - fix: BUG-001 spawn agent - PixiJS 8.x Graphics API

---

## 📊 Progress

| Molecule | Status |
|----------|--------|
| M9: Manual Testing | 🔴 IN PROGRESS |
| M10: Bug Fixes | ⚪ PENDING |
| M11: Error Handling | ⚪ PENDING |
| M12: UI Polish | ⚪ PENDING |

---

## 🔄 Handoff Note

**Для следующего агента:**

### Контекст
BUG-001 FIXED ✅ - Убран Graphics из AgentSprite.ts.

### Следующие шаги
1. Протестировать spawn всех ролей (Architect, Coder, Tester, Reviewer)
2. Добавить PNG-based статус индикатор (опционально)
3. Продолжить M9: Manual Testing

### Запуск
```bash
cd /Users/admin/projects/optimi-mac/agent-colony
pnpm dev
```
DevTools: View → Toggle DevTools или Cmd+Option+I

---

## 🔧 Quick Commands

```bash
cd /Users/admin/projects/optimi-mac/agent-colony
pnpm dev          # Development
pnpm type-check   # TypeScript check
pnpm build        # Production build
```

---

**Last Updated:** 2026-01-21 01:00
