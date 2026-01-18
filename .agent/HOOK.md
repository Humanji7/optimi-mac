# HOOK: MCP Servers Integration

**Status:** 🔴 ACTIVE
**Created:** 2026-01-18
**Target:** Global MCP config for 6 projects

---

## Molecules

### M1: Audit existing configs ✅
- [x] Read ~/.claude/settings.json (exists, no mcpServers)
- [x] Check existing .mcp.json (sphere-777: OK, My project: missing)
- [x] Collect env vars (most MCP-specific vars missing)

### M2: Create global MCP config ✅
- [x] Added 8 MCP servers to ~/.claude.json via `claude mcp add`
- [x] Servers: supabase, stripe, postgres, redis, cloudflare, telegram, sqlite

### M3: Setup environment variables ⬅️ CURRENT
- [ ] Create ~/.claude/.env with collected credentials
- [ ] Use ${VAR} syntax (no hardcoded secrets)

### M4: Local Unity MCP configs
- [ ] Verify sphere-777/.mcp.json
- [ ] Create "My project"/.mcp.json

### M5: Verify dependencies
- [ ] Check npx availability
- [ ] Check uvx availability
- [ ] Test MCP packages dry-run

### M6: Validation
- [ ] Test MCP loading in sample project

---

## Progress Log

| Molecule | Status | Commit |
|----------|--------|--------|
| M1 | 🔄 in_progress | - |
| M2 | ⏳ pending | - |
| M3 | ⏳ pending | - |
| M4 | ⏳ pending | - |
| M5 | ⏳ pending | - |
| M6 | ⏳ pending | - |
