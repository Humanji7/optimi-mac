# Research Architecture: 8 Layers of Context

> Reference architecture for Context Intelligence experiments

---

## Overview

AI dev tools fail because they lack context. This architecture captures 8 layers of project context for intelligent diagnostics.

```
┌────────────────────────────────────────┐
│           DIAGNOSTIC REQUEST           │
│        "Refactor auth.ts"              │
└────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│    CONTEXT INTELLIGENCE ENGINE         │
├────────────────────────────────────────┤
│  Layer 1: Code Structure               │
│  Layer 2: Git History                  │
│  Layer 3: Refactoring Memory           │
│  Layer 4: Dependencies                 │
│  Layer 5: Test Context                 │
│  Layer 6: Runtime Patterns             │
│  Layer 7: Project Health               │
│  Layer 8: Team Patterns                │
└────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│      CONTEXTUAL RECOMMENDATION         │
│  + Reasoning chain                     │
│  + Confidence score                    │
│  + Risk assessment                     │
└────────────────────────────────────────┘
```

---

## Layer Specifications

### Layer 1: Code Structure
**What:** AST analysis, complexity metrics, patterns
**Tech:** @babel/parser, escomplex
**Output:** Cyclomatic complexity, duplications, anti-patterns

### Layer 2: Git History
**What:** Churn, hotspots, temporal coupling
**Tech:** simple-git
**Output:** High-churn files, author distribution, coupling

### Layer 3: Refactoring Memory 🧠
**What:** Past refactorings + outcomes
**Tech:** Chroma + Mem0
**Output:** Similar cases, success rates, learned patterns

### Layer 4: Dependencies
**What:** Import/export graph, blast radius
**Tech:** madge, dependency-cruiser
**Output:** Affected files, coupling strength

### Layer 5: Test Context
**What:** Coverage, flaky tests, gaps
**Tech:** c8/nyc
**Output:** Untested functions, risk areas

### Layer 6: Runtime Patterns
**What:** Logs, errors, performance
**Tech:** Log parsing, metrics
**Output:** Production issues, slow functions

### Layer 7: Project Health
**What:** Trend analysis, predictions
**Tech:** Snapshot history + ML
**Output:** Health score, risk predictions

### Layer 8: Team Patterns
**What:** Review preferences, commit styles
**Tech:** Git + PR analysis
**Output:** Reviewer suggestions, style alignment

---

## Experiment Hooks

Points where experiments can vary the architecture:

| Hook | Experiment Ideas |
|------|------------------|
| **Layer Fusion** | Weighted average vs attention-based |
| **Memory Store** | Chroma vs Weaviate vs Mem0 |
| **Embedding Model** | text-embedding-3-small vs large |
| **Similarity Threshold** | 0.7 vs 0.8 vs dynamic |
| **Context Window** | How much context per layer? |

---

## Measurement Points

| Point | Metric |
|-------|--------|
| Context gathering | Time (target: <5s) |
| Similarity search | Latency (target: <100ms) |
| Recommendation | Relevance score (user feedback) |
| Outcome | Success rate (was advice followed?) |

---

## Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| 1-2 | Conceptual | Spec ready |
| 3 | Experiment ready | Mem0/Chroma |
| 4-5 | Conceptual | Tools identified |
| 6-8 | Future | Lower priority |

---

*Full technical spec: [context_intelligence_engine.md](../../claudedocs/context_intelligence_engine.md)*

*See also: [Related Work](related-work.md) | [Experiment Backlog](../ops/experiment-backlog.md)*
