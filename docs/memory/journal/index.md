# 📝 Error Journal: How to Log

> Capture what went wrong, understand why, learn for next time.

---

## When to Log

| Trigger | Description |
|---------|-------------|
| 🔄 **Looping** | Agent attempts same failing command 3+ times |
| 🙉 **Deafness** | Agent ignores specific instruction 2+ times |
| 💥 **Breakage** | Agent breaks existing features while adding new ones |
| 😤 **Frustration** | You feel "deja vu" about a bug |

---

## Entry Format

```markdown
## ERR-XXX: [Short Description]

**Date:** YYYY-MM-DD
**Project:** [project-name]
**Agent:** Claude Code / Cursor / Antigravity

**Что случилось:**
[What went wrong?]

**Почему:**
- [ ] Lack of context
- [ ] Ambiguous instruction
- [ ] Agent limitation
- [ ] Human oversight

**Урок:**
[What to remember]

**Prevention:**
[Rule or guardrail to add]

**Tags:** #tag1 #tag2
```

---

## Monthly Files

- [2026-01.md](2026-01.md) — Current month

---

## Review Cadence

Weekly: identify patterns, update rules in `.agent/rules/`

*Last updated: 2026-01-15*
