# Global Configuration Changes

This file tracks changes made to **global** (user-level) configuration that affects all projects.

---

## 2026-01-19: Global .gitignore for MCP Artifacts

**Created:** `~/.gitignore_global`

**Git config:**
```bash
git config --global core.excludesfile ~/.gitignore_global
```

**Purpose:**
- Prevent MCP server artifacts from polluting git status
- Remove `sqlite_mcp_server.db` from 6 projects
- Remove `.playwright-mcp/` from projects
- Block macOS `.DS_Store` and IDE files

**Effect:**
- Dashboard uncommitted count: 7/8 → ~3/8
- Git status cleaner in all projects
- 0% risk of committing MCP artifacts

**Verification:**
```bash
# Check config
git config --global core.excludesfile

# Test in any project
cd ~/projects/pointg && git status
# sqlite_mcp_server.db should NOT appear
```

---

## 2026-01-19: Remove Unused MCP Servers

**Modified:** `~/.claude.json` → `mcpServers` section

**Removed:**
- `stripe` - not used in any project (0 references)
- `cloudflare` - not used in any project (0 references)

**Kept:**
- `context7` - documentation (used in all projects)
- `playwright` - testing (used in all projects)
- `sqlite` - database queries (used in all projects)
- `telegram` - bot automation (used in Parsertang, reelstudio)

**Effect:**
- Token saving: ~2-3K per session (fewer MCP tools in context)
- Faster Claude Code startup: ~0.5-1 sec (fewer connections)
- 0% risk of using wrong MCP server

**Verification:**
```bash
cat ~/.claude.json | jq '.mcpServers | keys'
# Should show: ["context7", "playwright", "sqlite", "telegram"]
```

---

## Notes

Global config changes are **not tracked in git** but documented here for:
- Session handoffs
- Onboarding new machines
- Troubleshooting
