# Archived Hooks

Эта директория содержит завершённые Hooks.

## Naming Convention
```
HOOK_YYYYMMDD_HHMM_[task-slug].md
```

## Example
```
HOOK_20260110_1230_auth-system.md
HOOK_20260109_1445_refactor-api.md
```

## Когда архивировать

После завершения convoy:
```bash
mv .agent/HOOK.md ".agent/hooks/HOOK_$(date +%Y%m%d_%H%M)_[slug].md"
```

## Зачем хранить

1. **Аудит** — какие задачи выполнялись
2. **Patterns** — повторяющиеся molecules
3. **Seance** — контекст прошлых решений
