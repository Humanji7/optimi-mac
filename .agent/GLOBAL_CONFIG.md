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

## Notes

Global config changes are **not tracked in git** but documented here for:
- Session handoffs
- Onboarding new machines
- Troubleshooting
