# 🔴 ACTIVE CONVOY: Fix Electron Dev Workflow

**Created:** 2026-01-20
**Status:** 🔴 ACTIVE
**Current:** M2

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

### 🔴 M2: Create tsconfig.main.json
**Goal:** Создать отдельный tsconfig для main process
**Status:** 🔴 CURRENT
**Files:** `tsconfig.main.json`

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

### ⚪ M3: Update package.json Scripts
**Goal:** Обновить scripts для dev workflow
**Status:** ⚪ PENDING
**Files:** `package.json`

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

### ⚪ M4: Update vite.config.ts
**Goal:** Добавить explicit root для renderer
**Status:** ⚪ PENDING
**Files:** `vite.config.ts`

**Changes:**
- Add `root: 'src/renderer'`
- Update `outDir: '../../dist/renderer'`

---

### ⚪ M5: Verify Setup
**Goal:** Проверить что `pnpm dev` работает
**Status:** ⚪ PENDING
**Files:** N/A (testing)

**Tests:**
1. [ ] `pnpm dev` запускается без ошибок
2. [ ] Electron открывается с интерфейсом
3. [ ] Hot reload работает для renderer
4. [ ] `pnpm build` создаёт production build
5. [ ] `pnpm preview` запускает production build

---

## 📊 Progress

- Completed: 2/6 molecules (33%)
- Current: M2
- Remaining: M2, M3, M4, M5

---

## 🧭 Navigation

**Resume command:** "Продолжи M1"
**Next molecule:** M2 - Create tsconfig.main.json
