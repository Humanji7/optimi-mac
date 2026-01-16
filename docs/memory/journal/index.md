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

## Quick Start

```bash
bash ~/.agent/scripts/log-error.sh
```
Or click **📝 Log Error** button in Dashboard.

---

## Error Types (9 categories)

| # | Type | Description |
|---|------|-------------|
| 1 | **Agent limitations** | AI misunderstood context or made wrong assumptions |
| 2 | **Human oversight** | User provided incomplete/wrong instructions |
| 3 | **Tooling failures** | Infrastructure, deployment, or framework bugs |
| 4 | **Communication gaps** | Misaligned expectations between human and agent |
| 5 | **Context overflow** | Agent "forgot" earlier discussion (LLM memory limit) |
| 6 | **Hallucination** | Agent invented non-existent API/file/feature |
| 7 | **Regression** | Fix broke something that previously worked |
| 8 | **Scope creep** | Asked for X, agent did X + Y + Z unasked |
| 9 | **Silent failure** | No error shown but result is wrong |

---

## Entry Format

```markdown
## ERR-XXX: [Short Description]

**Date:** YYYY-MM-DD
**Project:** [project-name]
**Agent:** Claude Code / Cursor / Antigravity
**Type:** [One of 9 categories above]

**Что случилось:**
[What went wrong?]

**Почему:**
[Root cause analysis]

**Урок:**
[What to remember]

**Tags:** #tag1 #tag2
```

---

## Monthly Files

- [2026-01.md](2026-01.md) — Current month

---

## Review Cadence

Weekly: identify patterns, update rules in `.agent/rules/`

*Last updated: 2026-01-15*
