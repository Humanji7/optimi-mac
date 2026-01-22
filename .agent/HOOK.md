# HOOK: Security Hardening for Production

**Status:** 🔴 ACTIVE
**Created:** 2026-01-22
**Type:** Security Hardening
**Priority:** HIGH (перед production release)

---

## ⚠️ MANDATORY WORKFLOW RULE

> **После завершения КАЖДОЙ молекулы:**
> 1. `git commit` результат
> 2. Проверить что приложение запускается (`pnpm dev`)
> 3. Только потом — следующая молекула

**Нарушение = сломанный билд = откат**

---

## 📋 Current Convoy: Security Hardening

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M1 | Sandbox mode | Включить sandbox: true | ⬜ PENDING |
| M2 | CSP headers | Content-Security-Policy в index.html | ⬜ PENDING |
| M3 | Entitlements | macOS entitlements для native modules | ⬜ PENDING |
| M4 | Notarization | electron-builder + @electron/notarize | ⬜ PENDING |

---

## M1: Enable Sandbox Mode

### Файлы для изменения

| Файл | Что менять |
|------|------------|
| `agent-colony/src/main/index.ts` | Добавить `sandbox: true` в webPreferences |

### Изменение

```typescript
// src/main/index.ts:24-28
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,  // ← ДОБАВИТЬ
},
```

### Проверка

```bash
pnpm dev
# Приложение должно запуститься без ошибок
# Терминал агента должен работать
```

### Риски

- Sandbox может сломать node-pty в preload — проверить!
- Если сломается, откатить и добавить в M3 entitlement `com.apple.security.cs.allow-jit`

---

## M2: Add CSP Headers

### Файлы для изменения

| Файл | Что менять |
|------|------------|
| `agent-colony/index.html` | Добавить CSP meta tag |

### Изменение

```html
<!-- index.html в <head> после <meta charset> -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' ws://localhost:*">
```

### Объяснение CSP директив

| Директива | Значение | Почему |
|-----------|----------|--------|
| `default-src 'self'` | Всё только из приложения | Базовая защита |
| `script-src 'self'` | Скрипты только локальные | Предотвращает XSS |
| `style-src 'self' 'unsafe-inline'` | Стили + inline | PixiJS/React требуют inline |
| `img-src 'self' data: blob:` | Картинки + data URI | Спрайты, canvas |
| `connect-src 'self' ws://localhost:*` | WebSocket для dev | HMR в development |

### Проверка

```bash
pnpm dev
# Открыть DevTools → Console
# Не должно быть CSP violation errors
```

---

## M3: Create Entitlements

### Файлы для создания

| Файл | Назначение |
|------|------------|
| `agent-colony/build/entitlements.mac.plist` | Entitlements для подписи |
| `agent-colony/build/entitlements.mac.inherit.plist` | Entitlements для helper processes |

### entitlements.mac.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Для node-pty и better-sqlite3 native modules -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>

    <!-- Для доступа к файловой системе (проекты пользователя) -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>

    <!-- Для tmux/shell -->
    <key>com.apple.security.automation.apple-events</key>
    <true/>
</dict>
</plist>
```

### entitlements.mac.inherit.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
</dict>
</plist>
```

### Обновить package.json

```json
"build": {
  "appId": "com.agent-colony.app",
  "mac": {
    "category": "public.app-category.developer-tools",
    "target": ["dmg"],
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.inherit.plist"
  },
  ...
}
```

### Проверка

```bash
pnpm build
# Билд должен пройти без ошибок
```

---

## M4: Setup Notarization

### Зависимости

```bash
cd agent-colony
pnpm add -D @electron/notarize
```

### Файлы для создания/изменения

| Файл | Назначение |
|------|------------|
| `agent-colony/scripts/notarize.js` | Скрипт нотаризации |
| `agent-colony/package.json` | afterSign hook |

### scripts/notarize.js

```javascript
const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('Skipping notarization: APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD not set');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log('Notarization complete!');
};
```

### Обновить package.json build config

```json
"build": {
  "appId": "com.agent-colony.app",
  "mac": {
    "category": "public.app-category.developer-tools",
    "target": ["dmg"],
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.inherit.plist"
  },
  "afterSign": "scripts/notarize.js",
  ...
}
```

### Переменные окружения (для CI/CD)

```bash
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

### Проверка (без реальной подписи)

```bash
# Проверить что скрипт не падает без credentials
pnpm build
# Должен вывести "Skipping notarization: APPLE_ID... not set"
```

---

## 🎯 Команды для работы

```bash
cd /Users/admin/projects/optimi-mac/agent-colony

# Development
pnpm dev

# Build (без подписи)
pnpm build

# Build с нотаризацией (требует credentials)
APPLE_ID=... APPLE_APP_SPECIFIC_PASSWORD=... APPLE_TEAM_ID=... pnpm build
```

---

## 📝 Resume Prompt

```
Продолжи работу над Security Hardening.

Текущий статус: HOOK.md активен
Молекулы: M1-M4 (sandbox, CSP, entitlements, notarization)

Начни с первой незавершённой молекулы.
После каждой — git commit и проверка pnpm dev.
```

---

## 🔗 References

- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)
- [Code Signing](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [@electron/notarize](https://github.com/electron/notarize)
