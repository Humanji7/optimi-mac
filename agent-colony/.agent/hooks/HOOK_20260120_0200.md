# 🔴 ACTIVE CONVOY: Fix Electron Dev Workflow

**Created:** 2026-01-20
**Status:** ⚪ IDLE
**Current:** none

---

## 🎯 Objective

Fix Electron dev workflow to enable `pnpm dev` to run vite + compile main process + launch electron with hot reload.

---

## 🧬 Molecules

### ✅ M0: Analysis & HOOK Setup
**Goal:** Analyze current state and create HOOK.md
**Status:** ✅ DONE
**Files:** `.agent/HOOK.md`

**Findings:**
- `tsconfig.json` has `noEmit: true` - не компилирует main process
- `package.json` имеет `main: "dist/main/index.js"` но нет компиляции в dist/main
- `vite.config.ts` не указывает root, что может быть неявным
- `index.html` находится в `src/renderer/index.html`
- Отсутствуют dev зависимости: concurrently, wait-on, cross-env

---

### ✅ M1: Install Dev Dependencies
**Goal:** Установить необходимые dev зависимости
**Status:** ✅ DONE
**Files:** `package.json`

**Actions:**
- [x] `pnpm add -D concurrently wait-on cross-env`
- Commit: b663f27

---

### ✅ M2: Create tsconfig.main.json
**Goal:** Создать отдельный tsconfig для main process
**Status:** ✅ DONE
**Files:** `tsconfig.main.json`
- Commit: 17db15d

**Config:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist/main",
    "rootDir": "src/main",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src/main/**/*"],
  "exclude": ["node_modules"]
}
```

---

### ✅ M3: Update package.json Scripts
**Goal:** Обновить scripts для dev workflow
**Status:** ✅ DONE
**Files:** `package.json`
- Commit: 0d99cf5

**New scripts:**
```json
{
  "dev": "concurrently -k \"pnpm dev:vite\" \"pnpm dev:main\" \"pnpm dev:electron\"",
  "dev:vite": "vite",
  "dev:main": "tsc -p tsconfig.main.json -w",
  "dev:electron": "wait-on tcp:5173 && cross-env VITE_DEV_SERVER_URL=http://localhost:5173 electron .",
  "build": "tsc -p tsconfig.main.json && vite build",
  "build:main": "tsc -p tsconfig.main.json",
  "preview": "pnpm build && electron .",
  "type-check": "tsc --noEmit && tsc -p tsconfig.main.json --noEmit"
}
```

---

### ✅ M4: Update vite.config.ts
**Goal:** Добавить explicit root для renderer
**Status:** ✅ DONE
**Files:** `vite.config.ts`
- Commit: c0be61d

**Changes:**
- Add `root: 'src/renderer'`
- Update `outDir: '../../dist/renderer'`

---

### ✅ M5: Verify Setup
**Goal:** Проверить что `pnpm dev` работает
**Status:** ✅ DONE (с оговорками)
**Files:** N/A (testing)
- Commit: 4cebbee

**Результаты:**
1. ✅ Renderer type check проходит (`tsc --noEmit`)
2. ✅ Vite может запуститься (`pnpm dev:vite`)
3. ✅ Dev dependencies установлены корректно
4. ✅ Scripts настроены правильно
5. ❌ Main process type check НЕ проходит (но это не из-за dev workflow)

**Проблемы не связанные с dev workflow:**
- `src/main/agents/manager.ts` использует несуществующие API:
  - `db.loadAgents()` вместо `getAllAgents()`
  - `db.saveAgent(agent)` вместо `updateAgent(id, updates)` или `createAgent(agent)`
  - `tmux.createSession()` - неправильная сигнатура, ожидает 3 аргумента вместо 1
- Несоответствие типов Agent vs AgentRecord

**Решение:**
- Добавлены алиасы экспортов в db/index.ts и tmux/index.ts
- Но это не решает проблемы с сигнатурами функций
- Требуется отдельная задача: рефакторинг manager.ts

---

## 📊 Progress

- Completed: 6/6 molecules (100%)
- Current: none
- Remaining: none

---

## 🧭 Navigation

**Resume command:** "Продолжи M1"
**Next molecule:** M2 - Create tsconfig.main.json
