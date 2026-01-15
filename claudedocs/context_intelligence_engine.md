# 🧠 Multi-Layer Context Intelligence Engine

**Концепция:** Context-Orchestrated Refactoring & Diagnostics
**Базис:** Night Watch → Контекстуальная диагностическая машина

---

## 🎯 Ключевая идея

**Проблема текущих AI dev tools:**
```
User: "Refactor this code"
AI: *Смотрит только на код* → Предлагает рефакторинг
Result: 40% revert rate, broken tests, missed dependencies
```

**Почему ломается:**
- Нет контекста проекта (архитектура, паттерны)
- Нет истории (что работало раньше?)
- Нет понимания зависимостей (что сломается?)
- Нет учёта тестов (coverage? флакирующие тесты?)
- Нет team context (кто будет ревьювить? их предпочтения?)

**Решение: Multi-Layer Context Intelligence**
```
User: "Refactor this code"

AI: *Собирает контекст из 8 слоёв*
  → Анализирует с полной картиной
  → Предлагает контекстуально-оптимальное решение
  → Объясняет reasoning на основе контекста

Result: 85% success rate, predictable outcomes, explainable
```

---

## 🏗️ Архитектура: 8 слоёв контекста

```
┌─────────────────────────────────────────────────────────────┐
│                    Diagnostic Request                        │
│              "Refactor auth.ts" / "Fix bug X"               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Context Intelligence Orchestrator                 │
│                                                              │
│  Aggregates context from all layers → Unified view          │
└─────────────────────────────────────────────────────────────┘
                            ▼
        ┌───────────────────────────────────────┐
        │     Layer 1: Code Structure           │ ← AST, complexity, patterns
        ├───────────────────────────────────────┤
        │     Layer 2: Git History              │ ← Commits, churn, authors
        ├───────────────────────────────────────┤
        │     Layer 3: Refactoring Memory       │ ← Past refactorings, outcomes
        ├───────────────────────────────────────┤
        │     Layer 4: Dependencies             │ ← Package.json, imports, usage
        ├───────────────────────────────────────┤
        │     Layer 5: Test Context             │ ← Coverage, flaky tests, gaps
        ├───────────────────────────────────────┤
        │     Layer 6: Runtime Patterns         │ ← Logs, errors, performance
        ├───────────────────────────────────────┤
        │     Layer 7: Project Health           │ ← Timeline, hooks, status
        ├───────────────────────────────────────┤
        │     Layer 8: Team Patterns            │ ← Review feedback, preferences
        └───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Quality Scoring                         │
│                                                              │
│  Confidence: 87% (high)                                      │
│  Coverage: 7/8 layers available                              │
│  Freshness: All data <24h old                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Diagnostic Reasoning Engine                          │
│                                                              │
│  1. Analyze with full context                                │
│  2. Generate contextual recommendations                      │
│  3. Predict impact across all layers                         │
│  4. Explain reasoning (XAI)                                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Actionable Output                               │
│                                                              │
│  • Diagnosis with reasoning                                  │
│  • Risk assessment                                           │
│  • Step-by-step plan                                         │
│  • Expected outcomes                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Layer 1: Code Structure Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  ast_analysis: {
    complexity: {
      cyclomatic: 8.5,
      cognitive: 12,
      lines: 450
    },

    patterns: {
      design_patterns: ["singleton", "factory"],
      anti_patterns: ["god_class", "deep_nesting"],
      duplications: [
        {
          code: "if (user.role === 'admin')",
          occurrences: 5,
          locations: ["auth.ts:45", "auth.ts:120", ...]
        }
      ]
    },

    structure: {
      classes: 3,
      functions: 18,
      exports: 12,
      dependencies: ["bcrypt", "jsonwebtoken", "./db"]
    }
  },

  quality_metrics: {
    maintainability_index: 65,
    test_coverage: 48%,
    type_coverage: 92%
  }
}
```

### Как используем

**При рефакторинге:**
```javascript
if (complexity.cyclomatic > 10) {
  recommendation = "Split into smaller functions";
  rationale = "High complexity (8.5) near threshold";
  priority = "high";
}

if (duplications.length > 3) {
  recommendation = "Extract to shared utility";
  rationale = `Code '${duplications[0].code}' repeated ${duplications[0].occurrences}x`;
  priority = "medium";
}
```

**При диагностике:**
```javascript
if (quality_metrics.maintainability_index < 70) {
  diagnosis = "Low maintainability detected";
  root_causes = [
    "Cyclomatic complexity: 8.5 (threshold: 5)",
    "Cognitive complexity: 12 (threshold: 7)",
    "File length: 450 lines (threshold: 300)"
  ];
  suggested_actions = [
    "Break into 2-3 modules by responsibility",
    "Extract duplicated logic to utils",
    "Reduce nesting depth (current: 4, target: 2)"
  ];
}
```

### Технологии

- **AST Parser:** `@babel/parser` для JavaScript/TypeScript
- **Complexity:** `escomplex` или собственный анализатор
- **Duplications:** `jscpd` или embedding-based similarity
- **Quality Metrics:** собственные формулы + ML scoring

---

## 📚 Layer 2: Git History Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  churn_analysis: {
    commits_last_30d: 23,
    unique_authors: 4,
    avg_commits_per_week: 5.75,
    trend: "increasing" // was 3.2, now 5.75
  },

  hotspots: [
    {
      function: "validateToken",
      commits: 8,
      authors: ["dev1", "dev2", "dev3"],
      reason: "Bug fixes + feature additions",
      risk_level: "high"
    }
  ],

  blame_context: {
    last_major_change: {
      commit: "a1b2c3d",
      author: "dev1",
      date: "2026-01-10",
      message: "refactor: extract token validation",
      files_changed: 5,
      outcome: "successful" // from memory
    }
  },

  temporal_coupling: [
    {
      file: "src/db.ts",
      correlation: 0.85,
      meaning: "auth.ts и db.ts обычно меняются вместе"
    }
  ]
}
```

### Как используем

**Риск-анализ перед рефакторингом:**
```javascript
if (churn_analysis.commits_last_30d > 20) {
  warning = "⚠️ High churn area - refactor carefully";
  rationale = "23 commits in 30d (avg: 5) suggests instability";
  recommendation = "Wait for churn to decrease OR use incremental refactoring";
}

if (hotspots[0].commits > 5) {
  warning = "🔥 Hotspot detected: validateToken function";
  rationale = "8 commits by 3 different devs = high collision risk";
  recommendation = "Prioritize this function in refactoring";
}

if (temporal_coupling[0].correlation > 0.8) {
  alert = "📎 Temporal coupling with db.ts";
  rationale = "85% of auth.ts changes require db.ts changes";
  action = "Include db.ts in refactoring plan";
}
```

**Предсказание impact:**
```javascript
// Если рефакторим auth.ts, какова вероятность что нужно менять другие файлы?
predicted_impact = {
  db.ts: 0.85,        // очень вероятно
  api.ts: 0.62,       // вероятно
  middleware.ts: 0.45 // может быть
};

recommendation = "Plan for 3-file refactoring, not 1-file";
```

### Технологии

- **Git API:** `isomorphic-git` или `simple-git`
- **Churn Analysis:** собственная имплементация
- **Temporal Coupling:** корреляционный анализ коммитов
- **Hotspot Detection:** commit frequency + author diversity

---

## 🧠 Layer 3: Refactoring Memory Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  historical_refactorings: [
    {
      date: "2025-12-15",
      type: "extract_function",
      scope: "validateToken logic",
      outcome: {
        success: true,
        metrics: {
          complexity_before: 12,
          complexity_after: 6,
          tests_passed: true,
          reverted: false
        },
        user_feedback: "clean, works great"
      },
      linked_memories: ["refactor_db_2025_12_20"] // что случилось дальше
    }
  ],

  similar_files_refactorings: [
    {
      file: "src/api.ts",
      similarity: 0.78,
      refactoring: {
        type: "split_by_responsibility",
        outcome: "successful",
        strategy: "incremental_with_tests"
      },
      applicable: true,
      confidence: 0.82
    }
  ],

  learned_patterns: {
    "auth_modules": {
      best_strategy: "extract_to_middleware",
      success_rate: 0.88,
      avg_improvement: 45%, // complexity reduction
      risks: ["token validation edge cases"],
      mitigation: "Preserve original logic, add more tests"
    }
  },

  anti_patterns_memory: [
    {
      pattern: "aggressive_inlining",
      attempted: "2025-11-20",
      outcome: "reverted",
      reason: "Broke integration tests",
      lesson: "Never inline in auth modules without 80%+ coverage"
    }
  ]
}
```

### Как используем

**Контекстуальные рекомендации:**
```javascript
// Ищем похожие успешные рефакторинги
const similar = similar_files_refactorings
  .filter(r => r.similarity > 0.7 && r.outcome === "successful")
  .sort((a, b) => b.confidence - a.confidence);

if (similar.length > 0) {
  recommendation = {
    strategy: similar[0].refactoring.strategy,
    confidence: similar[0].confidence,
    rationale: `
      Похожий файл ${similar[0].file} (78% similarity)
      успешно рефакторился стратегией '${similar[0].refactoring.type}'

      Применяем те же техники:
      1. ${extractTechniques(similar[0])}
      2. ${extractTechniques(similar[0])}
      3. ${extractTechniques(similar[0])}
    `
  };
}

// Проверяем анти-паттерны
const risks = anti_patterns_memory.filter(ap =>
  isRelevant(ap, current_file)
);

if (risks.length > 0) {
  warnings = risks.map(r => ({
    pattern: r.pattern,
    message: `❌ Avoid '${r.pattern}' - failed ${r.attempted}`,
    lesson: r.lesson
  }));
}
```

**Адаптивное планирование:**
```javascript
// На основе learned_patterns
const strategy = learned_patterns[file_category];

if (strategy) {
  plan = {
    approach: strategy.best_strategy,
    expected_improvement: strategy.avg_improvement,
    confidence: strategy.success_rate,

    phases: generatePhases(strategy),

    risk_mitigation: strategy.risks.map(risk => ({
      risk: risk,
      mitigation: strategy.mitigation
    }))
  };
}
```

### Технологии

- **A-MEM** (Zettelkasten для связывания рефакторингов)
- **Similarity Search** через Chroma (code embeddings)
- **Pattern Extraction** через ML классификатор
- **Outcome Tracking** в SQLite

---

## 📦 Layer 4: Dependencies Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  direct_dependencies: [
    {
      name: "bcrypt",
      version: "5.1.1",
      usage_locations: ["auth.ts:12", "auth.ts:45"],
      functions_used: ["hash", "compare"],
      risk_level: "low",
      security_audit: {
        vulnerabilities: 0,
        last_audit: "2026-01-10"
      }
    },
    {
      name: "jsonwebtoken",
      version: "9.0.2",
      usage_locations: ["auth.ts:78", "auth.ts:120"],
      functions_used: ["sign", "verify"],
      risk_level: "medium",
      notes: "Version 8.x had security issues"
    }
  ],

  internal_dependencies: [
    {
      file: "src/db.ts",
      imports: ["getUser", "updateUser"],
      usage_count: 8,
      coupling_strength: "high",
      change_risk: "if db.ts changes signature, auth.ts breaks"
    }
  ],

  dependents: [
    {
      file: "src/api.ts",
      imports_from_auth: ["validateToken", "authenticate"],
      usage_count: 15,
      impact_if_broken: "critical", // API endpoints break
      test_coverage: 65%
    },
    {
      file: "src/middleware/auth.middleware.ts",
      imports_from_auth: ["authenticate"],
      usage_count: 3,
      impact_if_broken: "high"
    }
  ],

  dependency_graph: {
    upstream: ["db.ts", "config.ts"],
    downstream: ["api.ts", "middleware/*", "routes/*"],
    blast_radius: 12 // files affected if auth.ts breaks
  }
}
```

### Как используем

**Impact Prediction:**
```javascript
// Перед рефакторингом показываем blast radius
if (dependency_graph.blast_radius > 5) {
  warning = "⚠️ High-impact file detected";
  impact_report = `
    Refactoring auth.ts will potentially affect:

    🔴 Critical (15 uses):
      - api.ts (validateToken used in 15 endpoints)
      - Breaking this = API down

    🟡 High (3 uses):
      - auth.middleware.ts
      - Breaking this = auth middleware fails

    🟢 Medium (5 uses):
      - routes/user.ts, routes/admin.ts

    💡 Recommendation:
      1. Write integration tests first
      2. Use incremental refactoring
      3. Keep public API stable
      4. Run full test suite after each phase
  `;
}
```

**Dependency Risk Analysis:**
```javascript
// Проверяем безопасность зависимостей перед рефакторингом
const vulnDeps = direct_dependencies.filter(d =>
  d.security_audit.vulnerabilities > 0
);

if (vulnDeps.length > 0) {
  alert = "🚨 Security vulnerabilities in dependencies";
  action = "Update dependencies BEFORE refactoring";
  rationale = "Refactoring with vulnerable deps = double risk";
}

// Проверяем версии
const outdatedDeps = direct_dependencies.filter(d =>
  isOutdated(d.version)
);

if (outdatedDeps.length > 0) {
  suggestion = "Consider updating deps first";
  rationale = "Refactoring + dep updates = separate concerns";
}
```

**Coupling Reduction Opportunities:**
```javascript
// Находим tight coupling
const tightlyCoupled = internal_dependencies.filter(d =>
  d.coupling_strength === "high"
);

if (tightlyCoupled.length > 0) {
  opportunity = {
    type: "decoupling",
    target: tightlyCoupled[0].file,
    message: `
      auth.ts и ${tightlyCoupled[0].file} сильно связаны

      Current: auth.ts → db.ts (8 calls, direct import)

      Opportunity: Введи Repository pattern
      Benefit: Легче тестировать, меньше coupling

      Refactoring strategy:
      1. Create IAuthRepository interface
      2. Inject dependency
      3. Mock in tests
    `
  };
}
```

### Технологии

- **Dependency Parser:** `madge` или `dependency-cruiser`
- **AST Import Analysis:** `@babel/traverse`
- **Security Audit:** `npm audit` + Snyk API
- **Blast Radius:** собственный граф-анализ
- **Coupling Metrics:** code + git history correlation

---

## 🧪 Layer 5: Test Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  test_files: [
    "src/auth.test.ts",
    "tests/integration/auth.integration.test.ts"
  ],

  coverage: {
    line: 48%,
    branch: 35%,
    function: 62%,
    statement: 48%,

    uncovered_lines: [45, 78, 120, 145, 167],
    uncovered_functions: ["handleTokenExpiry", "refreshToken"],

    critical_gaps: [
      {
        function: "validateToken",
        coverage: 35%,
        risk: "high",
        reason: "Core auth logic with low coverage"
      }
    ]
  },

  test_quality: {
    total_tests: 18,
    passing: 17,
    failing: 1,
    skipped: 0,

    flaky_tests: [
      {
        name: "should validate expired token",
        flaky_rate: 0.15, // fails 15% of time
        reason: "Timing-dependent",
        last_failure: "2026-01-12"
      }
    ],

    test_types: {
      unit: 12,
      integration: 5,
      e2e: 1
    },

    assertion_density: 2.3, // assertions per test (low)
    avg_test_length: 45 // lines (high = complex tests)
  },

  test_history: {
    added_with_code: false, // tests added AFTER code
    last_test_update: "2025-12-20",
    code_last_update: "2026-01-10",
    delta: "21 days", // tests outdated

    regression_history: [
      {
        date: "2025-12-25",
        broken_by: "commit a1b2c3d",
        tests_broken: 3,
        time_to_fix: "4 hours"
      }
    ]
  }
}
```

### Как используем

**Pre-Refactoring Risk Assessment:**
```javascript
// Оцениваем риск рефакторинга на основе тестов
const risk = calculateRefactoringRisk(test_context);

if (coverage.line < 60%) {
  risk_level = "high";
  rationale = `
    ⚠️ Test coverage слишком низкая: 48%

    Critical gaps:
    - validateToken: 35% coverage (CORE FUNCTION!)
    - refreshToken: 0% coverage (NOT TESTED AT ALL)

    Risk: Рефакторинг может сломать untested code незаметно

    Recommendation: Write tests FIRST

    Suggested test cases:
    1. validateToken with expired token
    2. validateToken with malformed token
    3. refreshToken happy path
    4. refreshToken with invalid refresh token
  `;

  action = "BLOCK refactoring until coverage > 60%";
  // OR: Generate test cases automatically
  auto_generated_tests = generateTests(uncovered_functions);
}

if (test_quality.flaky_tests.length > 0) {
  warning = "🔀 Flaky tests detected";
  impact = "May give false confidence during refactoring";
  action = "Fix flaky tests before refactoring";
}
```

**Test-Driven Refactoring Plan:**
```javascript
// Генерируем план с тестами
const plan = {
  phase_1: {
    name: "Add missing tests",
    actions: [
      "Test validateToken edge cases (expired, malformed, invalid signature)",
      "Test refreshToken happy path + error cases",
      "Increase coverage to 70%+"
    ],
    success_criteria: "All tests green, coverage 70%+",
    estimated_time: "2 hours"
  },

  phase_2: {
    name: "Refactor with test safety net",
    actions: [
      "Extract validateToken to separate function",
      "Run tests after each extraction",
      "If any test fails: rollback immediately"
    ],
    success_criteria: "All tests still green, complexity reduced",
    estimated_time: "3 hours"
  },

  phase_3: {
    name: "Verify and extend",
    actions: [
      "Run full test suite",
      "Add integration tests for refactored code",
      "Update test documentation"
    ],
    success_criteria: "100% passing, no regression",
    estimated_time: "1 hour"
  }
};
```

**Automatic Test Generation:**
```javascript
// Для uncovered functions генерируем заглушки тестов
const generatedTests = uncovered_functions.map(func => {
  const signature = extractSignature(func);
  const edgeCases = inferEdgeCases(func, code_analysis);

  return `
describe('${func.name}', () => {
  it('should handle happy path', () => {
    // TODO: Implement
    const input = ${generateMockInput(signature)};
    const result = ${func.name}(input);
    expect(result).toBeDefined();
  });

  ${edgeCases.map(edge => `
  it('should handle ${edge.scenario}', () => {
    // TODO: Implement
    const input = ${edge.mockInput};
    ${edge.expectedBehavior}
  });
  `).join('\n')}
});
  `;
});
```

### Технологии

- **Coverage:** `c8` или `nyc` для Node.js
- **Flaky Detection:** собственный анализ CI logs
- **Test Quality Metrics:** собственные формулы
- **Auto Test Generation:** GPT-4 + code context
- **Mutation Testing:** `stryker` для проверки качества тестов

---

## 📊 Layer 6: Runtime Patterns Context

### Что собираем

```javascript
{
  file: "src/auth.ts",

  production_logs: {
    error_frequency: {
      "TokenExpiredError": {
        count: 450,
        trend: "increasing", // was 200/day, now 450/day
        peak_times: ["09:00-11:00", "14:00-16:00"],
        affected_users: 1200,
        severity: "medium"
      },
      "InvalidTokenError": {
        count: 45,
        trend: "stable",
        correlated_with: "deploy_2026_01_10"
      }
    },

    performance_metrics: {
      avg_execution_time: {
        validateToken: "12ms",
        authenticate: "45ms",
        refreshToken: "230ms" // SLOW!
      },

      p95_latency: {
        validateToken: "35ms",
        authenticate: "120ms",
        refreshToken: "580ms" // ОЧЕНЬ медленно
      },

      hotspots: [
        {
          function: "refreshToken",
          reason: "Database query inside loop",
          optimization_potential: "80% reduction possible"
        }
      ]
    },

    usage_patterns: {
      calls_per_hour: {
        validateToken: 15000,
        authenticate: 3000,
        refreshToken: 450
      },

      call_paths: [
        "api.ts → auth.ts → validateToken (87% of calls)",
        "middleware.ts → auth.ts → authenticate (13%)"
      ]
    }
  },

  error_correlation: {
    "TokenExpiredError": {
      preconditions: [
        "User session idle > 2h",
        "Token refresh failed silently"
      ],
      follow_up_errors: [
        "UnauthorizedError in api.ts",
        "SessionExpiredError in frontend"
      ],
      business_impact: "User logged out, frustration"
    }
  },

  monitoring_alerts: [
    {
      type: "PerformanceDegradation",
      function: "refreshToken",
      threshold: "200ms",
      current: "230ms",
      status: "warning",
      since: "2026-01-08"
    }
  ]
}
```

### Как используем

**Performance-Aware Refactoring:**
```javascript
// Приоритизируем рефакторинг по performance impact
if (performance_metrics.p95_latency.refreshToken > "500ms") {
  priority = "CRITICAL";
  recommendation = {
    type: "performance_refactoring",
    target: "refreshToken function",
    rationale: `
      🐌 Performance hotspot detected:

      Current: p95 = 580ms (UNACCEPTABLE)
      Target: <100ms
      Impact: 450 calls/hour = 200+ seconds wasted/hour

      Root cause (from profiling):
      - Database query inside loop (Line 145)
      - Synchronous bcrypt calls (Line 167)

      Refactoring strategy:
      1. Move DB query outside loop → 60% improvement
      2. Use bcrypt.compare async → 20% improvement
      3. Add caching layer → 15% improvement

      Expected result: 580ms → 90ms (84% reduction)
    `,
    business_value: "450 calls/hour × 490ms saved = 3.7 minutes saved/hour"
  };
}
```

**Error-Driven Diagnostics:**
```javascript
// Если в production ошибки растут, диагностируем перед рефакторингом
if (error_frequency.TokenExpiredError.trend === "increasing") {
  diagnosis = {
    symptom: "TokenExpiredError frequency doubled (200 → 450/day)",

    root_cause_hypothesis: [
      {
        hypothesis: "Token TTL слишком короткий",
        confidence: 0.75,
        evidence: [
          "Peak times match business hours (users active longer)",
          "Error count correlates with user sessions > 2h"
        ],
        validation: "Check token TTL config (currently: 1h?)",
        fix: "Increase TTL to 4h OR implement auto-refresh"
      },
      {
        hypothesis: "Refresh token logic broken",
        confidence: 0.60,
        evidence: [
          "InvalidTokenError spike after deploy_2026_01_10",
          "refreshToken function has low test coverage"
        ],
        validation: "Review commit a1b2c3d (auth changes)",
        fix: "Rollback OR fix refresh logic"
      }
    ],

    recommended_action: "FIX BUGS BEFORE REFACTORING",
    rationale: "Refactoring broken code = масло в огонь"
  };

  action = "BLOCK refactoring, open incident investigation";
}
```

**Usage-Pattern Optimization:**
```javascript
// Оптимизируем на основе real usage
const hotPath = usage_patterns.call_paths[0]; // 87% calls

if (hotPath.includes("validateToken")) {
  optimization = {
    type: "hot_path_optimization",
    message: `
      📈 validateToken вызывается 15,000 раз/час (87% всех auth calls)

      Current performance: 12ms avg, 35ms p95

      Optimization opportunities:
      1. Add memoization (5ms reduction)
      2. Lazy load crypto (2ms reduction)
      3. Optimize signature verification (3ms reduction)

      Impact:
      - 10ms × 15,000 calls = 150 seconds saved/hour
      - 3.6 minutes saved/hour
      - 86 hours saved/year

      ROI: High priority для рефакторинга
    `
  };
}
```

**Proactive Monitoring Integration:**
```javascript
// После рефакторинга автоматически добавляем мониторинг
const refactoringPlan = {
  phases: [...],

  monitoring_plan: {
    pre_refactoring: {
      baseline_metrics: {
        validateToken_latency: "12ms",
        error_rate: "0.01%",
        throughput: "15000/hour"
      }
    },

    post_refactoring: {
      alert_if: [
        "latency > baseline × 1.2", // +20% = alert
        "error_rate > baseline × 2",
        "throughput < baseline × 0.9"
      ],

      rollback_if: [
        "error_rate > 1%", // was 0.01%
        "p95_latency > 50ms" // was 35ms
      ]
    },

    observation_period: "24 hours",

    success_criteria: {
      latency: "≤ baseline",
      error_rate: "≤ baseline",
      no_new_error_types: true
    }
  }
};
```

### Технологии

- **Log Analysis:** ELK stack, Datadog, или собственный парсинг
- **APM:** New Relic, Datadog APM для performance metrics
- **Error Tracking:** Sentry, Rollbar
- **Correlation Engine:** собственная логика + ML для pattern detection
- **Real-time Alerts:** webhooks из monitoring систем

---

## 📈 Layer 7: Project Health Timeline Context

### Что собираем

```javascript
{
  project: "my-api",
  file: "src/auth.ts",

  health_timeline: [
    {
      date: "2026-01-01",
      health_score: 85,
      metrics: {
        uncommitted: 1,
        active_hooks: 0,
        test_coverage: 65%,
        complexity_avg: 5.2
      },
      status: "healthy"
    },
    {
      date: "2026-01-05",
      health_score: 72,
      metrics: {
        uncommitted: 3,
        active_hooks: 1,
        test_coverage: 62%,
        complexity_avg: 6.1
      },
      status: "warning",
      events: ["Started refactoring auth module"]
    },
    {
      date: "2026-01-10",
      health_score: 58,
      metrics: {
        uncommitted: 7,
        active_hooks: 2,
        test_coverage: 48%, // DROPPED!
        complexity_avg: 8.5  // INCREASED!
      },
      status: "critical",
      events: [
        "Refactoring incomplete",
        "Tests broken",
        "No commits in 48h"
      ],
      triggered_alerts: ["predictive_crash_alert"]
    }
  ],

  trend_analysis: {
    health_trend: "declining",
    velocity: -2.5, // points per day
    projected_crash_date: "2026-01-13",
    confidence: 0.78
  },

  correlation_with_file: {
    auth_changes_correlation: 0.82,
    message: "Project health decline коррелирует с auth.ts changes",
    evidence: [
      "Health score dropped after auth.ts refactoring started",
      "Test coverage drop = tests broken in auth.test.ts",
      "Complexity increase = auth.ts grew from 300 to 450 lines"
    ]
  },

  recovery_patterns: [
    {
      similar_decline: "2025-12-01 to 2025-12-05",
      resolution: "Rolled back incomplete refactoring",
      time_to_recovery: "2 days",
      lessons: "Complete refactoring in smaller chunks"
    }
  ]
}
```

### Как используем

**Context-Aware Intervention:**
```javascript
// Если health declining, диагностика учитывает это
if (trend_analysis.health_trend === "declining") {
  context = {
    message: `
      ⚠️ Project health declining for ${calculateDays()} days

      Timeline:
      - Jan 1: Healthy (score: 85)
      - Jan 5: Warning (score: 72) → Started auth refactoring
      - Jan 10: Critical (score: 58) → Refactoring incomplete

      Correlation with auth.ts: 82%

      Root cause hypothesis:
      Your auth refactoring is causing project health decline

      Evidence:
      1. Test coverage dropped 65% → 48% (tests broken)
      2. Complexity increased 5.2 → 8.5 (refactoring incomplete)
      3. No commits in 48h (stuck?)

      Similar past situation:
      Dec 2025: Similar decline, resolved by rollback
      Time to recovery: 2 days

      Recommendations:
      Option A: Complete refactoring (estimated: 4h)
      Option B: Rollback and restart with smaller scope
      Option C: Commit current state, fix tests, then continue

      Projected crash: Jan 13 (3 days) if no action
    `,

    urgency: "high",
    recommended_option: "C", // commit + fix
    rationale: "Preserve progress, reduce risk"
  };
}
```

**Predictive Intervention:**
```javascript
// Если trend показывает будущий crash, предупреждаем
if (trend_analysis.projected_crash_date < Date.now() + 5_DAYS) {
  alert = {
    type: "predictive_crash_alert",
    message: `
      🚨 PREDICTED CRASH in 3 days (Jan 13)

      Based on:
      - Health declining at -2.5 pts/day
      - Current: 58 points
      - Crash threshold: 50 points
      - ETA: 3 days

      Confidence: 78% (based on 12 similar past cases)

      URGENT ACTIONS:
      1. Stop new work
      2. Commit current changes
      3. Fix broken tests
      4. Run full Triage

      Alternative: Rollback to Jan 5 (last healthy state)
    `,

    actions: [
      { label: "Commit & Fix", handler: "commit_and_triage" },
      { label: "Rollback", handler: "git_reset_to_jan5" },
      { label: "Ignore (risky)", handler: "dismiss_alert" }
    ]
  };
}
```

**Historical Context for Refactoring:**
```javascript
// Перед рефакторингом проверяем, не было ли проблем раньше
const pastAttempts = recovery_patterns.filter(p =>
  p.similar_decline && p.resolution.includes("refactoring")
);

if (pastAttempts.length > 0) {
  warning = {
    message: `
      ⚠️ Historical pattern detected

      Previous refactoring attempt (Dec 2025):
      - Started: Dec 1 (health: 85)
      - Declined to: 52 by Dec 5
      - Resolution: Rolled back incomplete refactoring
      - Lesson: "Complete refactoring in smaller chunks"

      Current situation (Jan 2026):
      - Started: Jan 5 (health: 85)
      - Declined to: 58 by Jan 10
      - Pattern: SAME as Dec 2025

      Recommendation:
      Apply lesson from Dec: Break into smaller chunks

      Suggested plan:
      1. Commit current progress
      2. Create HOOK with 3 small molecules
      3. Complete one molecule per day
      4. Run tests after each molecule
    `,

    lesson_applied: "incremental_refactoring",
    expected_outcome: "Avoid rollback, complete successfully"
  };
}
```

### Технологии

- **Time-Series DB:** InfluxDB или собственная имплементация
- **Trend Analysis:** Linear regression + ML forecasting
- **Correlation Engine:** Pearson correlation + causal inference
- **Pattern Matching:** DTW (Dynamic Time Warping) для поиска похожих паттернов

---

## 👥 Layer 8: Team Patterns Context

### Что собираем

```javascript
{
  project: "my-api",
  file: "src/auth.ts",

  team_context: {
    ownership: {
      primary_owner: "dev1",
      contributors: ["dev2", "dev3"],
      last_editor: "dev1",
      expertise_level: {
        dev1: "expert", // 50+ commits in auth module
        dev2: "intermediate", // 10-20 commits
        dev3: "beginner" // <5 commits
      }
    },

    code_review_patterns: {
      typical_reviewers: ["dev2", "tech_lead"],
      avg_review_time: "4 hours",
      approval_criteria: {
        tests_required: true,
        coverage_threshold: 70%,
        performance_check: true
      },

      common_feedback: [
        {
          pattern: "Prefer explicit error handling",
          frequency: 12,
          examples: ["PR#45", "PR#67", "PR#89"]
        },
        {
          pattern: "Add JSDoc for public methods",
          frequency: 8
        },
        {
          pattern: "Use async/await instead of promises",
          frequency: 5
        }
      ]
    },

    team_preferences: {
      style_guide: {
        naming: "camelCase for functions, PascalCase for classes",
        error_handling: "explicit try/catch, no silent failures",
        documentation: "JSDoc required for public API",
        testing: "AAA pattern (Arrange, Act, Assert)"
      },

      architecture_patterns: [
        "Repository pattern for DB access",
        "Middleware for auth logic",
        "Dependency injection via constructor"
      ],

      tech_debt_tolerance: "low", // team aggressive about debt
      refactoring_frequency: "high" // refactor often
    },

    collaboration_patterns: {
      typical_workflow: [
        "1. Create feature branch",
        "2. TDD (tests first)",
        "3. Small commits (every 3-5 file changes)",
        "4. PR after feature complete",
        "5. Address review feedback",
        "6. Merge with squash"
      ],

      communication_channels: {
        code_questions: "Slack #dev",
        architecture_decisions: "Weekly sync",
        urgent_issues: "Slack DM to tech_lead"
      }
    },

    historical_conflicts: [
      {
        type: "merge_conflict",
        files: ["auth.ts", "db.ts"],
        frequency: "high", // 5 conflicts in 2 months
        reason: "Multiple devs working on auth simultaneously",
        resolution_time_avg: "30 minutes"
      }
    ]
  }
}
```

### Как используем

**Team-Aware Refactoring Recommendations:**
```javascript
// Адаптируем рекомендации под team preferences
const refactoringPlan = generatePlan(code_context);

// Apply team preferences
refactoringPlan.style = applyStyleGuide(team_context.style_guide);
refactoringPlan.patterns = usePreferredPatterns(team_context.architecture_patterns);

// Example output
const teamAwareRecommendation = {
  strategy: "extract_to_repository",
  rationale: `
    Applying team's preferred patterns:

    ✅ Repository pattern (team standard)
    ✅ Dependency injection via constructor
    ✅ Explicit error handling (no silent failures)

    Code will follow team conventions:
    - camelCase for functions
    - JSDoc for all public methods
    - AAA test pattern

    This ensures:
    - Faster code review (matches team expectations)
    - Lower chance of feedback cycle
    - Consistency with existing codebase
  `
};
```

**Review Prediction & Pre-Optimization:**
```javascript
// Предсказываем feedback от reviewers на основе истории
const predictedFeedback = code_review_patterns.common_feedback
  .filter(f => isRelevant(f, refactored_code));

if (predictedFeedback.length > 0) {
  pre_review_optimization = {
    message: `
      🔮 Predicted code review feedback:

      Based on ${code_review_patterns.common_feedback.length} past reviews:

      1. "Add JSDoc for public methods" (80% probability)
         → Auto-generating JSDoc for new methods

      2. "Prefer explicit error handling" (70% probability)
         → Refactoring includes explicit try/catch

      3. "Use async/await" (50% probability)
         → Converting promises to async/await

      These changes applied BEFORE PR submission
      Expected result: Faster approval, fewer feedback cycles
    `,

    actions_taken: [
      "Added JSDoc to 5 new methods",
      "Replaced promises with async/await in 3 places",
      "Added explicit error handling in validateToken"
    ],

    estimated_time_saved: "2-4 hours" // fewer review cycles
  };
}
```

**Collaboration Conflict Prevention:**
```javascript
// Если файл часто конфликтует, предупреждаем
const conflict = historical_conflicts.find(c =>
  c.files.includes("auth.ts") && c.frequency === "high"
);

if (conflict) {
  warning = {
    type: "collaboration_risk",
    message: `
      ⚠️ High merge conflict risk detected

      Historical data:
      - auth.ts had 5 merge conflicts in last 2 months
      - Reason: Multiple devs working simultaneously
      - Avg resolution time: 30 minutes

      Current risk:
      - dev2 is also working on auth module (checked git branches)
      - Their branch: feature/oauth-integration
      - Overlap: Both touching validateToken function

      Recommendations:
      1. Coordinate with dev2 (Slack #dev)
      2. Merge their changes first, then rebase
      3. OR: Split work - you take X, they take Y

      Communication template:
      "Hey dev2, I see you're working on auth.ts too.
       I'm refactoring validateToken. Want to coordinate?"
    `,

    actions: [
      { label: "Message dev2", handler: "slack_message" },
      { label: "Check their PR", handler: "open_pr_link" },
      { label: "Proceed anyway", handler: "continue_refactoring" }
    ]
  };
}
```

**Ownership-Aware Routing:**
```javascript
// Если рефакторим чужой код, учитываем ownership
if (ownership.primary_owner !== current_user) {
  recommendation = {
    message: `
      ℹ️ You're refactoring ${ownership.primary_owner}'s code

      Context:
      - ${ownership.primary_owner} is the expert (50+ commits)
      - You have ${getUserExpertise(current_user)} expertise level

      Recommendations:
      1. Review their past PRs for style/patterns
      2. Smaller, incremental changes (lower risk)
      3. Involve them in code review
      4. Document reasoning extensively

      Auto-assigned reviewer: ${ownership.primary_owner}

      Communication tip:
      "Hey ${ownership.primary_owner}, I'm refactoring some auth logic.
       Could you review when done? Want to make sure it aligns
       with your vision for this module."
    `
  };
}
```

### Технологии

- **Git Analysis:** `git log`, `git blame` для ownership
- **GitHub/GitLab API:** для PR history, review patterns
- **NLP:** для анализа review comments и извлечения паттернов
- **Team Database:** собственная БД с preferences и conventions
- **Slack API:** для real-time collaboration warnings

---

## 🎯 Context Orchestration: Собираем всё вместе

### Unified Context View

```javascript
// Пример: Запрос на рефакторинг auth.ts

async function orchestrateContext(file, operation) {
  // Parallel context gathering (все слои параллельно)
  const [
    codeContext,
    gitContext,
    memoryContext,
    depsContext,
    testContext,
    runtimeContext,
    healthContext,
    teamContext
  ] = await Promise.all([
    layer1_getCodeStructure(file),
    layer2_getGitHistory(file),
    layer3_getRefactoringMemory(file),
    layer4_getDependencies(file),
    layer5_getTestContext(file),
    layer6_getRuntimePatterns(file),
    layer7_getProjectHealth(file),
    layer8_getTeamPatterns(file)
  ]);

  // Context quality assessment
  const contextQuality = assessContextQuality({
    codeContext,
    gitContext,
    memoryContext,
    depsContext,
    testContext,
    runtimeContext,
    healthContext,
    teamContext
  });

  // Если контекста недостаточно, собираем дополнительно
  if (contextQuality.confidence < 0.7) {
    const missing = contextQuality.missingLayers;
    console.warn(`⚠️ Insufficient context: ${missing.join(', ')}`);

    // Fallback strategies
    if (missing.includes('test_context')) {
      testContext = await fallbackTestAnalysis(file);
    }
  }

  // Unified context object
  return {
    file,
    operation,
    timestamp: Date.now(),

    // All layers
    layers: {
      code: codeContext,
      git: gitContext,
      memory: memoryContext,
      dependencies: depsContext,
      tests: testContext,
      runtime: runtimeContext,
      health: healthContext,
      team: teamContext
    },

    // Meta
    quality: contextQuality,
    freshness: calculateFreshness(layers),
    completeness: contextQuality.coverage // 7/8 layers = 87.5%
  };
}
```

### Diagnostic Reasoning Engine

```javascript
async function diagnoseWithContext(unifiedContext) {
  const { layers, quality } = unifiedContext;

  // 1. Risk Assessment (multi-layer)
  const risks = assessRisks(layers);

  // 2. Root Cause Analysis (cross-layer correlation)
  const rootCauses = findRootCauses(layers);

  // 3. Impact Prediction (dependency graph + runtime patterns)
  const predictedImpact = predictImpact(layers);

  // 4. Strategy Selection (memory + team patterns)
  const strategy = selectStrategy(layers);

  // 5. Reasoning Chain (explainable AI)
  const reasoning = buildReasoningChain({
    risks,
    rootCauses,
    predictedImpact,
    strategy
  });

  return {
    diagnosis: {
      summary: generateSummary(rootCauses),
      confidence: quality.confidence,
      risks: risks,
      root_causes: rootCauses
    },

    recommendation: {
      strategy: strategy,
      rationale: reasoning,
      expected_outcome: predictedImpact.positive,
      potential_issues: predictedImpact.negative
    },

    execution_plan: {
      phases: generatePhases(strategy, layers),
      testing_strategy: designTestStrategy(layers.tests),
      monitoring_plan: designMonitoring(layers.runtime),
      rollback_plan: designRollback(layers.git)
    },

    // XAI: Explainable AI
    explanation: {
      reasoning_chain: reasoning,
      key_factors: extractKeyFactors(reasoning),
      alternative_strategies: exploreAlternatives(strategy),
      confidence_breakdown: explainConfidence(quality)
    }
  };
}
```

### Example: Full Context Diagnosis

```javascript
// User: "Refactor src/auth.ts"

const context = await orchestrateContext("src/auth.ts", "refactor");
const diagnosis = await diagnoseWithContext(context);

console.log(diagnosis);

// Output:
{
  diagnosis: {
    summary: `
      auth.ts has multiple issues requiring attention BEFORE refactoring:

      🔴 Critical:
      - Low test coverage (48%) with critical gaps in validateToken
      - Performance hotspot: refreshToken (580ms p95)
      - Production errors increasing (450/day TokenExpiredError)

      🟡 Warnings:
      - High churn area (23 commits in 30d)
      - Tight coupling with db.ts (85% correlation)
      - Project health declining (score: 58)

      🟢 Positive:
      - Similar refactoring succeeded 2 weeks ago (api.ts)
      - Team has established patterns for auth modules
      - Good dependency health (no vulnerabilities)
    `,

    confidence: 0.87, // High confidence (7/8 layers available)

    root_causes: [
      {
        issue: "Low test coverage",
        evidence: [
          "Layer 5: Coverage 48% (threshold: 70%)",
          "Critical functions untested: refreshToken",
          "Tests outdated (21 days behind code)"
        ],
        impact: "High risk of breaking production",
        priority: 1
      },
      {
        issue: "Performance degradation",
        evidence: [
          "Layer 6: refreshToken p95 = 580ms (threshold: 200ms)",
          "DB query in loop detected (Line 145)",
          "Monitoring alert active since Jan 8"
        ],
        impact: "User experience degraded",
        priority: 2
      },
      {
        issue: "Project health declining",
        evidence: [
          "Layer 7: Health score 85 → 58 (14 days)",
          "Correlation with auth.ts changes: 82%",
          "Similar pattern in Dec 2025 (required rollback)"
        ],
        impact: "Predicted crash in 3 days",
        priority: 3
      }
    ]
  },

  recommendation: {
    strategy: "incremental_refactoring_with_fixes",

    rationale: `
      Based on multi-layer context analysis:

      Layer 3 (Memory): Similar refactoring (api.ts) succeeded with incremental approach
      Layer 5 (Tests): Must add tests BEFORE refactoring (too risky otherwise)
      Layer 6 (Runtime): Performance fix should be included in refactoring
      Layer 7 (Health): Project unstable, need careful approach to avoid crash
      Layer 8 (Team): Team prefers repository pattern + explicit error handling

      Recommended strategy combines:
      1. Test coverage improvement (Layer 5)
      2. Performance optimization (Layer 6)
      3. Incremental refactoring (Layer 3 learning)
      4. Team patterns application (Layer 8)

      Confidence: 87%
      Expected success rate: 85% (based on 12 similar cases)
    `,

    expected_outcome: {
      test_coverage: "48% → 75%",
      complexity: "8.5 → 4.2",
      performance: "580ms → 90ms",
      health_score: "58 → 80",
      time_estimate: "8-10 hours"
    },

    potential_issues: [
      {
        risk: "Merge conflict with dev2's branch",
        probability: 0.45,
        mitigation: "Coordinate with dev2 before starting"
      },
      {
        risk: "Test failures during refactoring",
        probability: 0.30,
        mitigation: "Incremental approach with test after each phase"
      }
    ]
  },

  execution_plan: {
    phases: [
      {
        id: 1,
        name: "Add missing tests",
        duration: "2 hours",
        actions: [
          "Write tests for refreshToken (0% → 80% coverage)",
          "Add edge case tests for validateToken",
          "Fix flaky test: 'should validate expired token'"
        ],
        success_criteria: "All tests green, coverage > 70%",
        rollback: "n/a (only adding tests)"
      },
      {
        id: 2,
        name: "Performance optimization",
        duration: "3 hours",
        actions: [
          "Move DB query outside loop in refreshToken",
          "Use async bcrypt.compare",
          "Add caching layer for token validation"
        ],
        success_criteria: "p95 latency < 100ms, all tests pass",
        rollback: "git checkout src/auth.ts (preserve tests from Phase 1)"
      },
      {
        id: 3,
        name: "Structural refactoring",
        duration: "3 hours",
        actions: [
          "Extract to repository pattern (team preference)",
          "Split into auth.service.ts + auth.repository.ts",
          "Apply explicit error handling"
        ],
        success_criteria: "Complexity < 5, all tests pass, code review approved",
        rollback: "git revert <commit> OR rollback to Phase 2"
      },
      {
        id: 4,
        name: "Integration & monitoring",
        duration: "1 hour",
        actions: [
          "Run full integration test suite",
          "Deploy to staging",
          "Monitor for 2 hours",
          "If stable: deploy to production with gradual rollout"
        ],
        success_criteria: "No errors, performance maintained, health score > 75",
        rollback: "Automated rollback if error rate > 0.1%"
      }
    ],

    testing_strategy: {
      phase_1: "Write new tests, achieve 70%+ coverage",
      phase_2: "Regression tests + performance benchmarks",
      phase_3: "Full unit + integration test suite",
      phase_4: "Smoke tests in production"
    },

    monitoring_plan: {
      metrics: [
        "error_rate (TokenExpiredError, InvalidTokenError)",
        "p95_latency (validateToken, refreshToken)",
        "throughput (calls per hour)",
        "health_score"
      ],
      alerts: [
        "error_rate > baseline × 2 → investigate",
        "latency > baseline × 1.5 → rollback",
        "health_score < 70 → pause and review"
      ],
      observation_period: "48 hours"
    },

    rollback_plan: {
      phase_2: "git checkout src/auth.ts (keep new tests)",
      phase_3: "git revert <refactoring_commit>",
      phase_4: "Automated rollback via deployment system",

      decision_criteria: {
        rollback_if: [
          "error_rate > 1%",
          "p95_latency > 200ms",
          "health_score drops > 10 points",
          "team consensus: rollback needed"
        ]
      }
    }
  },

  explanation: {
    reasoning_chain: [
      {
        step: 1,
        observation: "Test coverage too low (48%)",
        inference: "Refactoring without tests = high risk",
        conclusion: "Must add tests first",
        confidence: 0.95
      },
      {
        step: 2,
        observation: "Performance issues in refreshToken",
        inference: "Opportunity to fix during refactoring",
        conclusion: "Include performance optimization",
        confidence: 0.90
      },
      {
        step: 3,
        observation: "Similar refactoring succeeded incrementally",
        inference: "Incremental approach works for this team",
        conclusion: "Use 4-phase incremental plan",
        confidence: 0.85
      },
      {
        step: 4,
        observation: "Team prefers repository pattern",
        inference: "Code review will be faster if using team patterns",
        conclusion: "Apply repository pattern in Phase 3",
        confidence: 0.80
      }
    ],

    key_factors: [
      {
        factor: "Test coverage",
        importance: 0.30,
        reason: "Highest risk factor, must address first"
      },
      {
        factor: "Performance hotspot",
        importance: 0.25,
        reason: "Business impact (user experience)"
      },
      {
        factor: "Team patterns",
        importance: 0.20,
        reason: "Reduces review friction, faster approval"
      },
      {
        factor: "Memory (past success)",
        importance: 0.15,
        reason: "Proven strategy for this team/codebase"
      },
      {
        factor: "Project health",
        importance: 0.10,
        reason: "Need careful approach to avoid crash"
      }
    ],

    alternative_strategies: [
      {
        name: "aggressive_refactoring",
        description: "Refactor all at once without intermediate steps",
        pros: ["Faster (4h vs 8h)", "Simpler plan"],
        cons: ["High risk (40% revert rate)", "No safety net if fails"],
        why_not_chosen: "Context shows project health unstable, need safe approach"
      },
      {
        name: "postpone_refactoring",
        description: "Fix tests and performance first, refactor later",
        pros: ["Lower risk", "Addresses critical issues first"],
        cons: ["Slower overall", "May lose momentum"],
        why_not_chosen: "Can combine fixes with refactoring for efficiency"
      }
    ],

    confidence_breakdown: {
      overall: 0.87,

      by_layer: {
        code: 1.0,      // Full AST analysis available
        git: 0.95,      // Complete history
        memory: 0.90,   // 12 similar cases found
        deps: 1.0,      // Full dependency graph
        tests: 0.85,    // Coverage data + test history
        runtime: 0.75,  // Logs available but may be incomplete
        health: 0.90,   // Full timeline
        team: 0.70      // Some patterns inferred, not all explicit
      },

      factors_affecting: [
        "Runtime data incomplete (only 7 days of logs)",
        "Team patterns partially inferred (no explicit style guide doc)",
        "Memory confidence varies by similarity (78-92%)"
      ]
    }
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (3 weeks)

**Week 1: Infrastructure**
- [ ] Set up multi-layer context orchestrator
- [ ] Implement Layer 1 (Code Structure) + Layer 2 (Git History)
- [ ] Create unified context object schema

**Week 2: Memory & Dependencies**
- [ ] Implement Layer 3 (Refactoring Memory) с A-MEM
- [ ] Implement Layer 4 (Dependencies analysis)
- [ ] Context quality scoring engine

**Week 3: Testing & Integration**
- [ ] Implement Layer 5 (Test Context)
- [ ] Basic diagnostic reasoning engine
- [ ] Integration tests для context gathering

**Success Criteria:**
- ✅ 5/8 layers working
- ✅ Context gathering < 5 seconds
- ✅ 80% accuracy на basic diagnostics

---

### Phase 2: Advanced Context (4 weeks)

**Week 4-5: Runtime Patterns**
- [ ] Implement Layer 6 (Runtime Patterns)
- [ ] Log parsing + error correlation
- [ ] Performance metrics integration
- [ ] APM integration (Datadog/New Relic)

**Week 6: Project Health**
- [ ] Implement Layer 7 (Project Health Timeline)
- [ ] Trend analysis engine
- [ ] Predictive crash detection
- [ ] Recovery pattern matching

**Week 7: Team Patterns**
- [ ] Implement Layer 8 (Team Patterns)
- [ ] Code review pattern extraction
- [ ] Team preference learning
- [ ] Collaboration risk detection

**Success Criteria:**
- ✅ 8/8 layers working
- ✅ Context quality score > 0.85
- ✅ 75% diagnostic accuracy

---

### Phase 3: Intelligent Reasoning (3 weeks)

**Week 8: Reasoning Engine**
- [ ] Multi-layer risk assessment
- [ ] Root cause analysis with correlation
- [ ] Impact prediction model
- [ ] Strategy selection algorithm

**Week 9: Explainable AI**
- [ ] Reasoning chain generation
- [ ] Confidence scoring
- [ ] Alternative strategy exploration
- [ ] Interactive explanations

**Week 10: Integration & Polish**
- [ ] Night Watch integration
- [ ] Triage integration
- [ ] Dashboard visualization
- [ ] UX refinement

**Success Criteria:**
- ✅ 85% diagnostic accuracy
- ✅ 90% strategy success rate
- ✅ Explainable reasoning for all recommendations

---

## 💰 ROI: Context Intelligence Engine

### Development Cost
- **Phase 1-3:** 10 weeks × 40 hours = 400 hours
- **Hourly rate:** $100/hour
- **Total:** $40,000

### Operational Cost (monthly)
- **Embeddings API:** $20-50
- **APM Integration:** $100-200 (if using external)
- **Vector DB:** $50 (Chroma → Weaviate)
- **Total:** ~$200/month

### Benefits (per user, per month)

**Time Savings:**
- Diagnostic accuracy: 85% (vs 40% baseline)
  - Fewer failed refactorings: 5 hours saved
  - Correct diagnosis first try: 3 hours saved

- Context-aware decisions:
  - Less trial-and-error: 4 hours saved
  - Avoided rollbacks: 6 hours saved

- **Total: 18 hours/month** @ $100/hour = **$1,800/month value**

**Quality Improvements:**
- Production incidents: -60% (predictive alerts)
- Code review cycles: -40% (team pattern compliance)
- Merge conflicts: -50% (collaboration awareness)
- **Intangible but significant**

**Competitive Advantage:**
- **First context-aware dev tool**
- Deep moat через accumulated context
- Continuous learning creates lock-in

### Break-even Analysis

**Assumptions:**
- 20 active users
- Value: $1,800/user/month = $36,000/month
- Cost: $200/month operational
- Development: $40,000 amortized over 12 months = $3,333/month
- **Total monthly cost:** $3,533

**Break-even: Month 1** ✅
**12-month ROI: 1,019%** 🚀

---

## 🎯 Success Metrics

### Technical Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Context gathering time** | n/a | <5s | Time to collect all 8 layers |
| **Context quality score** | n/a | >0.85 | Completeness × freshness × confidence |
| **Diagnostic accuracy** | 40% | 85% | Correct diagnosis on first attempt |
| **Strategy success rate** | 60% | 90% | Refactorings completed without revert |
| **Prediction accuracy** | n/a | 75% | Crash/issue predictions correct |

### Business Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Time to resolution** | 6h | 2h | Time from issue to fix |
| **Revert rate** | 40% | <10% | Refactorings requiring rollback |
| **Production incidents** | X/month | -60% | Prevented via predictive alerts |
| **Code review cycles** | 2.5 | 1.5 | Iterations to approval |
| **User satisfaction** | n/a | 8/10 | Survey after 1 month usage |

### Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Feature adoption** | 70% | Users enabling context intelligence |
| **Context quality opt-in** | 80% | Users providing all context layers |
| **Recommendation follow rate** | 60% | Users following AI recommendations |
| **Explanation usage** | 50% | Users viewing reasoning chains |

---

## 🔥 Killer Features Showcase

### Feature 1: Predictive Crash Prevention

**Demo:**
```
Dashboard shows:
🚨 CRITICAL ALERT

Project: my-api
Risk Level: 87% probability of crash
ETA: 2 days

Reasoning (click to expand):
├─ Layer 7: Health declining 85 → 58 (14 days)
├─ Layer 2: High churn in auth.ts (23 commits/month, was 5)
├─ Layer 5: Test coverage dropped 65% → 48%
├─ Layer 3: Similar pattern in Dec 2025 → crashed
└─ Prediction: Crash on Jan 13 (confidence: 87%)

Actions:
[Commit & Fix Tests]  [Run Triage]  [Show Details]
```

**Value Prop:** "We predict crashes before they happen"

---

### Feature 2: Context-Aware Recommendations

**Demo:**
```
Night Watch --dry-run auth.ts

🧠 Multi-Layer Context Analysis

Context Quality: 87% (7/8 layers available)

┌─────────────────────────────────────────┐
│ Layer 1 (Code): Complexity 8.5 (high)   │
│ Layer 3 (Memory): Similar refactoring   │
│          succeeded 2 weeks ago           │
│ Layer 5 (Tests): Coverage 48% (LOW!)    │
│ Layer 6 (Runtime): Performance hotspot  │
│ Layer 8 (Team): Prefer repository       │
│          pattern                         │
└─────────────────────────────────────────┘

💡 Recommendation (confidence: 85%):

Strategy: incremental_refactoring_with_test_fixes

Rationale:
1. Similar refactoring (api.ts) succeeded incrementally
2. Low test coverage = must add tests first
3. Performance issue can be fixed simultaneously
4. Team prefers repository pattern (faster review)

Expected Outcome:
✅ Test coverage: 48% → 75%
✅ Complexity: 8.5 → 4.2
✅ Performance: 580ms → 90ms
✅ Time: 8-10 hours

[Show Full Plan]  [Alternative Strategies]  [Apply]
```

**Value Prop:** "Recommendations backed by 8 layers of context"

---

### Feature 3: Explainable Diagnostics

**Demo:**
```
User: "Why is this recommended?"

[Shows interactive reasoning chain]

🧠 Reasoning Chain (4 steps)

Step 1: Test Coverage Analysis
├─ Observation: Coverage 48% (Layer 5)
├─ Inference: Refactoring without tests = high risk
├─ Conclusion: Must add tests first
└─ Confidence: 95%

Step 2: Performance Opportunity
├─ Observation: refreshToken p95 = 580ms (Layer 6)
├─ Inference: Can optimize during refactoring
├─ Conclusion: Include performance fix
└─ Confidence: 90%

Step 3: Memory Learning
├─ Observation: Similar refactoring succeeded (Layer 3)
├─ Inference: Incremental approach works here
├─ Conclusion: Use 4-phase plan
└─ Confidence: 85%

Step 4: Team Patterns
├─ Observation: Team prefers repository pattern (Layer 8)
├─ Inference: Faster code review if compliant
├─ Conclusion: Apply repository pattern in Phase 3
└─ Confidence: 80%

Overall Confidence: 87% (weighted average)

[Why 87%?]  [Alternative Reasoning]  [Key Factors]
```

**Value Prop:** "Understand WHY, not just WHAT"

---

## 🏁 Conclusion

**Context Intelligence Engine = Game Changer**

**What we built:**
- Not just refactoring tool
- **Diagnostic reasoning system** that thinks in context
- 8-layer holistic view before any action
- Self-improving through memory accumulation

**Key Innovations:**
1. **Multi-Layer Context Orchestration** - никто не собирает столько контекста
2. **Predictive Crash Prevention** - видим будущее на основе паттернов
3. **Explainable AI Reasoning** - показываем "почему", не только "что"
4. **Continuous Context Learning** - становится умнее с каждым использованием

**Competitive Moats:**
- Context depth: 8 layers (competitors: 1-2)
- Memory accumulation: чем дольше используешь, тем лучше работает
- Personalization: адаптируется под team + codebase
- Explainability: transparency creates trust

**ROI:**
- Development: $40k
- Monthly value: $36k (20 users)
- Break-even: Month 1
- 12-month ROI: 1,019%

**Next Steps:**
1. Start Phase 1 (3 weeks to MVP)
2. Launch beta with 5-10 early adopters
3. Iterate based on real usage data
4. Full launch after Phase 3

**Vision:**
> "optimi-mac становится AI co-pilot, который **понимает контекст** так же глубоко, как senior engineer с 5-летним опытом в проекте"

Готов обсудить имплементацию любого из слоёв детальнее!
