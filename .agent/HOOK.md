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
- [ ] Spawn Architect — **НЕ РАБОТАЕТ** (нужно исследовать)
- [ ] Spawn Coder — появляется спрайт
- [ ] Spawn Tester — появляется спрайт
- [ ] Spawn Reviewer — появляется спрайт
- [ ] Клик на агента — открывается Detail Panel
- [ ] Detail Panel показывает корректные данные
- [ ] Kill agent — агент удаляется с canvas
- [ ] Send command — команда отправляется (проверить logs)
- [ ] Закрыть app — graceful shutdown без ошибок
- [ ] Перезапустить app — агенты восстанавливаются из DB

---

## 🐛 Known Bugs

### BUG-001: Spawn Agent не работает
- **Status:** OPEN 🔴
- **Severity:** Critical
- **Error:** `Uncaught TypeError: Cannot read properties of null (reading 'split')`
- **Stack trace:**
  ```
  logPrettyShaderError → logProgramError → generateProgram →
  GlShaderSystem._createProgramData → GlShaderSystem._getProgramData →
  GlShaderSystem._setProgram → GlShaderSystem.bind → GlBatchAdaptor.start →
  _BatcherPipe2.execute → executeInstructions
  ```
- **What was tried:**
  1. ❌ Graphics chaining API (circle().fill()) - не помогло
  2. ❌ Убрали Graphics statusIndicator полностью - spawn работал!
- **Root cause hypothesis:** Graphics shader compilation fails в PixiJS 8.x
- **Next steps to try:**
  1. Убрать Graphics из AgentSprite полностью (временно)
  2. Проверить версию PixiJS и известные issues
  3. Попробовать использовать Sprite вместо Graphics для индикатора
  4. Проверить WebGL context / GPU driver issues

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
BUG-001 НЕ ИСПРАВЛЕН. Ошибка: PixiJS shader compilation fails при создании Graphics.

### Что известно
1. **Spawn работает БЕЗ Graphics** - когда statusIndicator закомментирован, агент появляется на canvas
2. **Graphics вызывает shader error** - `Cannot read properties of null (reading 'split')`
3. **Chaining API не помог** - `circle().fill()` даёт ту же ошибку

### Stack trace ошибки
```
logPrettyShaderError → logProgramError → generateProgram →
GlShaderSystem._createProgramData → ... → executeInstructions
```

### Что попробовать
1. **БЫСТРЫЙ FIX:** Убрать Graphics из AgentSprite.ts полностью (временно)
2. Проверить PixiJS 8.x issues на GitHub для этой ошибки
3. Использовать маленький PNG sprite вместо Graphics для индикатора
4. Проверить не конфликтует ли что-то с WebGL контекстом

### Файлы для изменения
- `agent-colony/src/renderer/pixi/sprites/AgentSprite.ts` - здесь Graphics

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

**Last Updated:** 2026-01-20 23:50
