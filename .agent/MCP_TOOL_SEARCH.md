# MCP Tool Search — Автоматический выбор серверов

**Дата:** 2026-01-18
**Статус:** ✅ Активировано

---

## Что это

**MCP Tool Search** — технология Claude Code, которая автоматически выбирает нужные MCP-серверы на основе контекста задачи, вместо загрузки всех инструментов сразу.

### Как работает

1. **Без Tool Search (старый способ):**
   - Все MCP инструменты загружаются в контекст заранее
   - При 8 серверах → ~2000 токенов постоянно заняты
   - Контекст захламлён даже если серверы не нужны

2. **С Tool Search (новый способ):**
   - MCP инструменты откладываются
   - Claude ищет нужные серверы через MCPSearch tool
   - Загружаются только релевантные инструменты
   - Экономия 90% контекста

---

## Конфигурация

### Текущая настройка

Файл: `~/.claude/settings.json`

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5"
  }
}
```

**Режим:** `auto:5` — активируется когда MCP инструменты занимают >5% контекста

### Доступные режимы

| Значение | Поведение |
|----------|-----------|
| `auto` | Активируется при >10% контекста (по умолчанию) |
| `auto:5` | Активируется при >5% контекста (рекомендуется) |
| `auto:20` | Активируется при >20% контекста |
| `true` | Всегда включено |
| `false` | Отключено, все серверы загружаются сразу |

---

## Требования

| Компонент | Требование |
|-----------|------------|
| **Claude Code** | 2.1.7+ |
| **Модель** | Sonnet 4+, Opus 4+ (Haiku не поддерживает) |
| **MCP серверы** | Должны иметь хорошие server instructions |

---

## Как Claude выбирает серверы

1. Анализирует задачу пользователя
2. Вызывает `MCPSearch` с описанием задачи
3. Получает список релевантных MCP инструментов
4. Загружает только найденные инструменты

**Пример:**

```
Задача: "Создай Stripe checkout для product X"

→ MCPSearch("stripe payment checkout")
→ Найдено: stripe:create_payment_link, stripe:create_product
→ Загружены только эти 2 инструмента (вместо всех 100+)
```

---

## Server Instructions (важно!)

Для корректной работы Tool Search каждый MCP сервер должен иметь качественные **server instructions** — описание того, какие задачи он решает.

### Примеры хороших instructions

**Stripe:**
```
Handle Stripe payment operations including:
- Creating products, prices, and payment links
- Managing subscriptions and invoices
- Processing refunds and disputes
```

**Telegram:**
```
Send messages and media to Telegram users via API.
Interact with Telegram bots and manage chat operations.
```

**Cloudflare:**
```
Manage Cloudflare infrastructure:
- Workers, KV, R2, D1
- DNS, zones, analytics
- Deployments and configurations
```

---

## Проверка работы

Перезапусти Claude Code и проверь логи при выполнении задачи:

```bash
# Задача связана со Stripe
cd ~/projects/pointg
claude

# В логах должно появиться:
# [MCPSearch] Searching for: "stripe payment"
# [MCPSearch] Found: stripe:create_product, stripe:list_customers
```

---

## Эффект

### До (все серверы загружены)

```
Total context: 100K tokens
MCP tools:     15K tokens (15%)
Available:     85K tokens
```

### После (Tool Search активен)

```
Total context: 100K tokens
MCP tools:     1-2K tokens (1-2%)
Available:     98K tokens
```

**Экономия:** ~13K токенов на каждый запрос.

---

## Отключение (если нужно)

В `~/.claude/settings.json`:

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "false"
  }
}
```

Или через permissions:

```json
{
  "permissions": {
    "deny": ["MCPSearch"]
  }
}
```

---

**Готово. Tool Search настроен и будет автоматически выбирать нужные MCP-серверы.**
