# Финансовая модель OPTIMI

**Pre-Seed → Seed → Series A Trajectory**

---

## Assumptions

### Pricing

| Plan | Цена/мес | Цена/год | Target |
|------|----------|----------|--------|
| **Pro** | $49 | $470 (20% discount) | Индивидуальные разработчики |
| **Team** | $199 | $1,910 | Команды 5-10 человек |
| **Enterprise** | $999+ | Custom | Self-hosted, compliance |

**Blended ARPU:** $89/мес (с учётом mix)

---

### Customer Acquisition

| Канал | CAC | % от total |
|-------|-----|------------|
| Organic (content, SEO) | $50 | 40% |
| DevRel (conferences, community) | $150 | 30% |
| Paid (Google, LinkedIn) | $250 | 20% |
| Referral | $25 | 10% |

**Blended CAC:** $120

---

### Retention

| Период | Retention |
|--------|-----------|
| Month 1 | 85% |
| Month 3 | 70% |
| Month 6 | 60% |
| Month 12 | 50% |
| Month 24 | 40% |

**Average Lifetime:** 24 месяца  
**LTV:** $89 × 24 = **$2,136**  
**LTV/CAC:** 17.8x

---

## Unit Economics Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIT ECONOMICS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ARPU:        $89/месяц                                     │
│  CAC:         $120                                          │
│  Payback:     1.3 месяца                                    │
│                                                             │
│  LTV:         $2,136                                        │
│  LTV/CAC:     17.8x                                         │
│                                                             │
│  Gross Margin: 80%                                          │
│  Net Margin:   40% (at scale)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Revenue Model

### Year 1 (2026)

| Quarter | New Users | Churned | Active | MRR | ARR |
|---------|-----------|---------|--------|-----|-----|
| Q1 | 30 | 5 | 25 | $2,225 | $27K |
| Q2 | 50 | 10 | 65 | $5,785 | $69K |
| Q3 | 70 | 15 | 120 | $10,680 | $128K |
| Q4 | 100 | 20 | 200 | $17,800 | $214K |

**Year 1 Total ARR:** ~$214K

---

### Year 2 (2027)

| Quarter | New Users | Churned | Active | MRR | ARR |
|---------|-----------|---------|--------|-----|-----|
| Q1 | 200 | 40 | 360 | $32,040 | $384K |
| Q2 | 350 | 70 | 640 | $56,960 | $684K |
| Q3 | 500 | 100 | 1,040 | $92,560 | $1.1M |
| Q4 | 600 | 140 | 1,500 | $133,500 | $1.6M |

**Year 2 Total ARR:** ~$1.6M

---

### Year 3 (2028)

| Quarter | New Users | Churned | Active | MRR | ARR |
|---------|-----------|---------|--------|-----|-----|
| Q1 | 1,000 | 200 | 2,300 | $204,700 | $2.5M |
| Q2 | 1,500 | 300 | 3,500 | $311,500 | $3.7M |
| Q3 | 2,000 | 400 | 5,100 | $453,900 | $5.4M |
| Q4 | 2,500 | 600 | 7,000 | $623,000 | $7.5M |

**Year 3 Total ARR:** ~$7.5M

---

## Cost Structure

### Year 1

| Статья | Месяц | Год |
|--------|-------|-----|
| **Salaries** | | |
| - Founder(s) | $8,000 | $96,000 |
| - Engineer #1 (Q2+) | $6,000 | $54,000 |
| - DevRel (Q3+) | $4,000 | $24,000 |
| **Infrastructure** | | |
| - Cloud (AWS/GCP) | $500 | $6,000 |
| - APIs (OpenAI, etc) | $300 | $3,600 |
| - Tools (GitHub, etc) | $200 | $2,400 |
| **Marketing** | | |
| - Content/Ads | $1,000 | $12,000 |
| - Conferences | $500 | $6,000 |
| **Operations** | | |
| - Legal/Accounting | $300 | $3,600 |
| - Misc | $200 | $2,400 |
| **Total** | ~$21,000 | ~$210,000 |

---

### Year 2

| Статья | Месяц | Год |
|--------|-------|-----|
| **Salaries** | | |
| - Team (5 людей) | $35,000 | $420,000 |
| **Infrastructure** | $3,000 | $36,000 |
| **Marketing** | $8,000 | $96,000 |
| **Operations** | $2,000 | $24,000 |
| **Total** | ~$48,000 | ~$576,000 |

---

### Year 3

| Статья | Месяц | Год |
|--------|-------|-----|
| **Salaries** | | |
| - Team (12 людей) | $90,000 | $1,080,000 |
| **Infrastructure** | $15,000 | $180,000 |
| **Marketing** | $25,000 | $300,000 |
| **Sales** | $15,000 | $180,000 |
| **Operations** | $5,000 | $60,000 |
| **Total** | ~$150,000 | ~$1,800,000 |

---

## P&L Summary

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Revenue (ARR)** | $214K | $1.6M | $7.5M |
| **COGS (20%)** | $43K | $320K | $1.5M |
| **Gross Profit** | $171K | $1.28M | $6.0M |
| **Gross Margin** | 80% | 80% | 80% |
| **OpEx** | $210K | $576K | $1.8M |
| **EBITDA** | -$39K | $704K | $4.2M |
| **Net Margin** | -18% | 44% | 56% |

---

## Cash Flow & Runway

### Pre-Seed ($500K)

```
Начало:         $500,000
Month 1-6:      -$126,000 ($21K/мес)
Month 7-12:     -$144,000 ($24K/мес, +1 hire)
Revenue Y1:     +$100,000 (collected)
────────────────────────────
End of Y1:      $330,000

Month 13-18:    -$288,000 ($48K/мес)
Revenue H1 Y2:  +$180,000 (collected)
────────────────────────────
End of Month 18: $222,000
```

**Runway:** 20+ месяцев (с revenue)

---

### Seed Round Trigger

**When:** Q4 2026 или Q1 2027  
**Metrics для Seed:**
- ARR: $200K+
- Users: 200+
- Retention: >50% @ month 12
- Growth: 15%+ MoM

**Target Seed:** $2-3M @ $10-15M valuation

---

## Sensitivity Analysis

### Optimistic Case (+30%)

| Metric | Base | Optimistic |
|--------|------|------------|
| Y1 ARR | $214K | $278K |
| Y2 ARR | $1.6M | $2.1M |
| Y3 ARR | $7.5M | $9.8M |
| Break-even | Month 15 | Month 11 |

**Drivers:** Faster adoption, higher ARPU, viral coefficient

---

### Pessimistic Case (-30%)

| Metric | Base | Pessimistic |
|--------|------|-------------|
| Y1 ARR | $214K | $150K |
| Y2 ARR | $1.6M | $1.1M |
| Y3 ARR | $7.5M | $5.2M |
| Break-even | Month 15 | Month 20 |

**Drivers:** Slower adoption, higher churn, competition

**Mitigation:** Reduce burn rate, focus on retention over acquisition

---

## Key Metrics to Track

### North Star Metric
**Weekly Active Users using Memory Features**

### Growth Metrics
- New sign-ups (weekly)
- Activation rate (% using core features in week 1)
- MoM revenue growth

### Retention Metrics
- Day 7 / Day 30 / Day 90 retention
- Net Revenue Retention (NRR)
- Churn rate by cohort

### Engagement Metrics
- Memory items created per user
- Context layers used
- Predictions shown and acted upon

### Financial Metrics
- MRR / ARR
- CAC by channel
- LTV by cohort
- Burn rate / Runway

---

## Milestones & Funding Needs

| Milestone | Timeline | Funding Need |
|-----------|----------|--------------|
| **MVP + 50 users** | Q1 2026 | Pre-seed ($500K) ✓ |
| **PMF + 500 users** | Q4 2026 | — |
| **$1M ARR + 1,500 users** | Q4 2027 | Seed ($2-3M) |
| **$5M ARR + 5,000 users** | Q4 2028 | Series A ($10-15M) |
| **$20M ARR + 15,000 users** | Q4 2029 | Series B ($30-50M) |

---

## Exit Scenarios

### Scenario 1: Acquisition by Dev Tools Company

**Potential Acquirers:** GitHub/Microsoft, Atlassian, JetBrains, GitLab

**Timing:** Year 3-4  
**Valuation:** 8-12x ARR = $60-90M @ $7.5M ARR

### Scenario 2: Acquisition by AI Company

**Potential Acquirers:** OpenAI, Anthropic, Google

**Timing:** Year 2-3 (for technology/talent)  
**Valuation:** Strategic premium, $50-100M

### Scenario 3: Continue to Scale

**Path:** Series A → B → Growth → IPO/Late-stage acquisition  
**Timing:** Year 5-7  
**Valuation:** $300M-1B+ (depends on category creation)

---

## Summary

| Metric | Value |
|--------|-------|
| **Pre-seed Ask** | $500K |
| **Runway** | 18-20 months |
| **Break-even** | Month 15 (~$25K MRR) |
| **Y3 ARR Target** | $7.5M |
| **Seed Trigger** | $200K ARR, 200 users |
| **LTV/CAC** | 17.8x |
| **Gross Margin** | 80% |
