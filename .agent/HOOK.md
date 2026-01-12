# 🪝 HOOK: Auto-updating docs index

## GUPP Status: ACTIVE
> Если ты читаешь это — ТЫ ОБЯЗАН выполнить CURRENT molecule.

## Original Request
Создать самообновляющуюся документацию: скрипт генерации индекса + git pre-commit hook.

## Complexity: MEDIUM
- Files: 4
- Dependencies: none

---

## Molecules

### M1: generate-docs-index.sh — CURRENT 🔴
**Scope:** `.agent/scripts/generate-docs-index.sh`
**Steps:**
- [ ] Создать скрипт парсинга frontmatter из .md файлов
- [ ] Добавить парсинг --help из .sh скриптов
- [ ] Генерация docs-index.md
**Commit:** `feat(scripts): add generate-docs-index.sh`
**Verification:** `bash .agent/scripts/generate-docs-index.sh` создаёт валидный .md

### M2: Первичная генерация — PENDING ⚪
**Scope:** `.agent/docs-index.md`
**Steps:**
- [ ] Запустить скрипт
- [ ] Проверить результат
**Commit:** `docs: generate initial docs-index.md`

### M3: Git pre-commit hook — PENDING ⚪
**Scope:** `.git/hooks/pre-commit` или `.husky/`
**Steps:**
- [ ] Проверить есть ли husky
- [ ] Создать/обновить pre-commit hook
- [ ] Добавить вызов generate-docs-index.sh при изменениях в .agent/
**Commit:** `feat(hooks): auto-update docs on commit`

### M4: Verification — PENDING ⚪
**Steps:**
- [ ] Тестовый коммит с изменением в .agent/
- [ ] Проверить что docs-index.md обновился
**Commit:** `test: verify docs auto-update`

---

## Convoy Progress
- [ ] M1: generate-docs-index.sh
- [ ] M2: Первичная генерация
- [ ] M3: Git pre-commit hook
- [ ] M4: Verification

## Handoff History
| Timestamp | Agent | Completed | Notes |
|-----------|-------|-----------|-------|
| 2026-01-12 | opus | - | Created Hook |
