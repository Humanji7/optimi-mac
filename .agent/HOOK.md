# HOOK: MCP Servers Integration

**Status:** ⚪ IDLE (completed)
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

### M3: Setup environment variables ✅
- [x] Created .agent/MCP_ENV_SETUP.md with instructions
- [x] User must add vars to ~/.zshrc manually (security)

### M4: Local Unity MCP configs ✅
- [x] sphere-777/.mcp.json verified (already configured)
- [x] Created "My project"/.mcp.json

### M5: Verify dependencies ✅
- [x] npx 11.6.2, uvx 0.9.18 available
- [x] Fixed supabase package: supabase-mcp (not @supabase/mcp-server)
- [x] All packages exist in npm/pypi

### M6: Validation ✅
- [x] 6 servers working (context7, playwright, stripe, sqlite, sequential-thinking, github)
- [x] 5 servers pending env vars (postgres, redis, cloudflare, telegram, supabase)

---

## Progress Log

| Molecule | Status | Commit |
|----------|--------|--------|
| M1 | ✅ done | 98cad23 |
| M2 | ✅ done | dd50a79 |
| M3 | ✅ done | 5064707 |
| M4 | ✅ done | 7a3b1e1 |
| M5 | ✅ done | c664e7e |
| M6 | ✅ done | pending |
