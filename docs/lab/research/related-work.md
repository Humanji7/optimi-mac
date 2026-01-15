# Related Work

> Обзор смежных проектов для research context

---

## Memory Libraries

### Production-Ready

| Project | Approach | Strengths | Gaps |
|---------|----------|-----------|------|
| **Mem0** | Fact extraction + vector storage | Balance accuracy/speed, 66.9% LOCOMO | Black-box extraction |
| **Letta (MemGPT)** | OS-inspired memory tiers | Document analysis, auto swap | 4.4s latency |
| **LangMem** | LangChain integration | Ecosystem, procedural memory | 60s latency (!)  |

### Research Stage

| Project | Innovation | Status |
|---------|------------|--------|
| **A-MEM** | Zettelkasten for LLM, dynamic linking | NeurIPS 2025, code available |
| **ACAN** | Attention-based retrieval ranking | Frontiers paper |

### Collaboration Opportunities
- A-MEM: Active GitHub, can contribute
- Mem0: Open-source, large community

---

## Agent Frameworks

| Framework | Memory Support | Notes |
|-----------|---------------|-------|
| **LangChain/LangGraph** | Persistent state, memory helpers | 110k+ stars, production |
| **CrewAI** | Per-agent memory | 60% Fortune 500, growing |
| **AutoGen** | Flexible, merging with Semantic Kernel | GA Q1 2026 |

### Research Opportunity
Все frameworks имеют базовую память но нет:
- Cross-agent memory protocols
- Long-term learning from outcomes
- Explainable memory operations

---

## Vector Databases

| DB | Best For | Enterprise? |
|----|----------|-------------|
| **Pinecone** | Turnkey scale | SOC 2, HIPAA, GDPR |
| **Weaviate** | OSS flexibility | SOC 2 for managed |
| **Chroma** | Fast prototyping, DX | No compliance |

### Lab Choice
Start with **Chroma** (local, free), migrate to Weaviate if scale needed.

---

## LLM Providers with Memory

| Provider | Memory Approach | Philosophy |
|----------|----------------|------------|
| **OpenAI** | Proactive, always-on | Convenience over privacy |
| **Anthropic** | Opt-in, user-controlled | Privacy first |
| **Google** | Enterprise-focused Memory Bank | Vertex AI integration |

### Research Opportunity
All are **generic** memory (conversations). None specialize in:
- Development workflows
- Multi-layer context
- Outcome-based learning

---

## Key Differences from Lab Approach

| Existing Work | Lab Approach |
|---------------|--------------|
| Generic memory | Development-specific |
| 1-2 layers of context | 8 layers |
| No outcome tracking | Refactoring memory with success/fail |
| No prediction | Predictive health alerts |

---

## What to Learn

| From | Learning |
|------|----------|
| Mem0 | Balance extraction precision vs latency |
| A-MEM | Zettelkasten linking approach |
| Letta | Multi-tier memory management |
| LangChain | Ecosystem integration patterns |

---

*See also: [LLM Memory Survey](llm-memory-survey.md) | [Research Architecture](research-architecture.md)*
