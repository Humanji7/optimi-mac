# MCP Environment Variables Setup

Claude Code MCP серверы используют переменные окружения через `${VAR}` синтаксис.
Добавь эти переменные в `~/.zshrc` или `~/.zprofile`:

## Необходимые переменные

### Supabase (Campaign Inbox)
```bash
# Получить: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="sbp_..."
```

### Stripe (pointg)
```bash
# Получить: https://dashboard.stripe.com/test/apikeys
export STRIPE_SECRET_KEY="sk_test_..."
```

### PostgreSQL (reelstudio, pointg production)
```bash
# Формат: postgresql://user:pass@host:5432/dbname
export DATABASE_URI="postgresql://..."
```

### Redis (reelstudio)
```bash
export REDIS_URL="redis://localhost:6379/0"
```

### Cloudflare (reelstudio)
```bash
# Получить: https://dash.cloudflare.com/profile/api-tokens
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_API_TOKEN="..."
```

### Telegram (Parsertang)
```bash
# Получить: https://my.telegram.org/apps
export TELEGRAM_API_ID="12345678"
export TELEGRAM_API_HASH="abc123..."
```

## Применение

```bash
source ~/.zshrc
# или перезапусти терминал
```

## Проверка

```bash
claude mcp list
# Серверы со всеми переменными покажут ✓ Connected
```

## Статус MCP серверов

| Сервер | Статус | Проект |
|--------|--------|--------|
| ✅ stripe | Connected | pointg |
| ✅ telegram | Connected | Parsertang |
| ✅ cloudflare | Connected | reelstudio |
| ✅ sqlite | Connected | all |
| ✅ context7 | Connected | all |
| ✅ playwright | Connected | all |
| ✅ github | Connected | all |
| ✅ sequential-thinking | Connected | all |

## Конфигурация

Все переменные настроены в `~/.claude/settings.json` → `env`.

---
Generated: 2026-01-18
Updated: 2026-01-18 (cleanup completed)
