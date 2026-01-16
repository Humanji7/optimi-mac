# 🤖 Lab Agents

> AI agents as lab assistants

---

## Philosophy

AI agents are full participants in the lab, not just tools. Each has a role.

---

## Active Agents

### Researcher Agent
**Role:** Deep analysis, literature review, hypothesis generation
**Specialization:** LLM memory, context systems
**Model:** Claude 3.5 Sonnet

### Implementer Agent
**Role:** Code experiments, build prototypes
**Specialization:** Python, TypeScript, embeddings
**Model:** Claude / GPT-4o

### Reviewer Agent
**Role:** Critique experiments, find flaws
**Specialization:** Scientific rigor
**Model:** Any

---

## Communication Protocol

1. **Clear context:** Always provide full experiment context
2. **Explicit goals:** State what help is needed
3. **Memory handoff:** Document what agent learned for next session

---

## Memory Sharing

| Type | Approach |
|------|----------|
| Session memory | Context window |
| Project memory | HOOK.md + docs |
| Long-term memory | Vector DB (experimental) |

---

*See also: [Lab Manifesto](../core/lab-manifesto.md) | [Error Journal](../journal/index.md)*
