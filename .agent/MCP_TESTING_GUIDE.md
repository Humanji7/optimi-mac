# MCP Testing Guide — Проверка работы в проектах

**Дата:** 2026-01-18

---

## Быстрая проверка

### 1. Проверить доступность серверов

```bash
cd ~/projects/pointg
claude mcp list
```

**Ожидается:** 8 серверов показывают ✓ Connected

### 2. По проектам

| Проект | Команда | Ожидаемые серверы |
|--------|---------|-------------------|
| **pointg** | `cd ~/projects/pointg && claude mcp list` | stripe ✓, sqlite ✓, github ✓ |
| **Parsertang** | `cd ~/projects/Parsertang && claude mcp list` | telegram ✓, sqlite ✓ |
| **Campaign Inbox** | `cd ~/projects/"Campaign Inbox" && claude mcp list` | sqlite ✓, context7 ✓ |
| **reelstudio** | `cd ~/projects/reelstudio && claude mcp list` | cloudflare ✓, sqlite ✓ |
| **sphere-777** | `cd ~/projects/sphere-777 && claude mcp list` | mcp-unity ✓, sqlite ✓ |

---

## Проверка Tool Search в действии

### Тест 1: Stripe (pointg)

```bash
cd ~/projects/pointg
claude
```

**Задача:** "Создай тестовый продукт в Stripe"

**Ожидается:**
1. Claude НЕ загружает все 8 серверов сразу
2. Claude вызывает `MCPSearch("stripe product")`
3. Загружаются только Stripe инструменты
4. В логах: `[MCPSearch] Found: stripe:create_product`

### Тест 2: Telegram (Parsertang)

```bash
cd ~/projects/Parsertang
claude
```

**Задача:** "Отправь сообщение 'Hello' в Telegram"

**Ожидается:**
1. Claude вызывает `MCPSearch("telegram send message")`
2. Загружается только telegram:interact
3. Stripe, Cloudflare и другие НЕ загружаются

### Тест 3: Cloudflare (reelstudio)

```bash
cd ~/projects/reelstudio
claude
```

**Задача:** "Покажи список Workers в Cloudflare"

**Ожидается:**
1. Claude вызывает `MCPSearch("cloudflare workers")`
2. Загружается cloudflare:worker_list
3. Telegram и другие НЕ загружаются

---

## Проверка экономии токенов

### Без Tool Search (старый способ)

```
Initial context:
- System prompt: 500 tokens
- MCP tools (8 servers): ~15,000 tokens
- Available: ~85,000 tokens
```

### С Tool Search (текущий)

```
Initial context:
- System prompt: 500 tokens
- MCPSearch tool: 200 tokens
- Available: ~99,300 tokens

After task "Create Stripe product":
- Loaded stripe tools: ~2,000 tokens
- Available: ~97,500 tokens
```

**Экономия:** ~13,000 токенов на старте + динамическая загрузка только нужных инструментов

---

## Признаки что Tool Search работает

### ✅ Работает

- [ ] `claude mcp list` показывает Connected серверы
- [ ] В начале сессии доступен только `MCPSearch` tool
- [ ] При выполнении задачи загружаются только релевантные MCP инструменты
- [ ] Нерелевантные серверы НЕ загружаются
- [ ] Контекст чище, ответы быстрее

### ❌ НЕ работает (откатился на старый способ)

- Все MCP инструменты видны с первого запроса
- MCPSearch НЕ вызывается
- Контекст захламлён описаниями всех серверов

**Если не работает:**

```bash
# Проверь настройку
cat ~/.claude/settings.json | grep TOOL_SEARCH

# Должно быть:
"ENABLE_TOOL_SEARCH": "auto:5"

# Перезапусти Claude Code
```

---

## Debug: включить логи

В `~/.claude/settings.json`:

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5",
    "DEBUG": "mcp:*"
  }
}
```

Теперь в терминале будут видны вызовы MCPSearch:

```
[MCPSearch] Query: "stripe payment checkout"
[MCPSearch] Found: stripe:create_payment_link, stripe:create_product
[MCPSearch] Loading 2 tools from stripe
```

---

## Статус по проектам

| Проект | MCP Servers | Tool Search | Статус |
|--------|-------------|-------------|--------|
| ✅ pointg | stripe, sqlite, github | auto:5 | Working |
| ✅ Parsertang | telegram, sqlite | auto:5 | Working |
| ✅ Campaign Inbox | sqlite, context7 | auto:5 | Working |
| ✅ reelstudio | cloudflare, sqlite | auto:5 | Working |
| ✅ sphere-777 | mcp-unity, sqlite | auto:5 | Working |

---

**Готово. Tool Search работает глобально во всех проектах.**
