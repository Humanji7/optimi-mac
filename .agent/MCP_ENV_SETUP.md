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

## Статус по проектам

| Проект | MCP | Переменная | Источник |
|--------|-----|------------|----------|
| Campaign Inbox | supabase | SUPABASE_ACCESS_TOKEN | supabase.com/dashboard |
| Parsertang | telegram | TELEGRAM_API_ID, TELEGRAM_API_HASH | my.telegram.org |
| reelstudio | postgres, redis | DATABASE_URI, REDIS_URL | .env проекта |
| pointg | stripe | STRIPE_SECRET_KEY | stripe dashboard |

---
Generated: 2026-01-18
