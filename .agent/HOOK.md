# 🔴 ACTIVE HOOK: Refactor Scripts to utils.sh

> **Status:** ACTIVE
> **Created:** 2026-01-13
> **Convoy:** 3 molecules

## Context

Миграция скриптов на общий `utils.sh`:
- Заменить дублированные цвета → использовать константы из utils.sh
- Заменить echo с эмодзи → log_pass/log_fail/log_warn/log_info/log_header
- Заменить валидацию проекта → validate_project()
- Добавить `source "$(dirname "$0")/utils.sh"` в начало

## utils.sh API

```bash
# Constants
PROJECTS_DIR, RED, GREEN, YELLOW, BLUE, CYAN, NC

# Logging
log_pass "message"   # ✓ зелёный
log_fail "message"   # ✗ красный
log_warn "message"   # ⚠ жёлтый
log_info "message"   # ℹ синий
log_header "message" # ▶ cyan секция

# Validation
validate_project "name"  # returns 0/1
```

---

## Molecules

### M1: sandbox-test.sh (14KB) ✅ DONE
- [x] Добавить source utils.sh
- [x] Удалить локальные определения цветов
- [x] Заменить echo на log_* функции
- [x] Использовать validate_project
- [x] Тест: `.agent/scripts/sandbox-test.sh optimi-mac`

### M2: setup-ai-infrastructure.sh (12KB) ⚪ PENDING
- [ ] Добавить source utils.sh
- [ ] Удалить локальные определения цветов
- [ ] Заменить echo на log_* функции
- [ ] Использовать validate_project
- [ ] Тест: `.agent/scripts/setup-ai-infrastructure.sh --help`

### M3: projects-health-check.sh (9KB) ⚪ PENDING
- [ ] Добавить source utils.sh
- [ ] Удалить локальные определения цветов
- [ ] Заменить echo на log_* функции
- [ ] Тест: `.agent/scripts/projects-health-check.sh`

---

## Progress Log

| Molecule | Status | Commit |
|----------|--------|--------|
| M1 | ✅ | b67fba1 |
| M2 | ⚪ | - |
| M3 | ⚪ | - |

---

_Next: M2 setup-ai-infrastructure.sh_

<!-- Global hooks enabled: 2026-01-13 -->
