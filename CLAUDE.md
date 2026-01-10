# Agent Context

## 🚨🚨🚨 MANDATORY STARTUP GATE 🚨🚨🚨

> **You CANNOT proceed without completing this gate.**
> **Violation = failed task. No exceptions.**

### Step 1: Execute These Commands (COPY-PASTE EXACTLY)

```bash
cat .agent/HOOK.md 2>/dev/null | head -20
echo "---"
ls -la .agent/HOOK.md 2>/dev/null || echo "HOOK.md: NOT FOUND"
```

### Step 2: Self-Declaration (SAY THIS OUT LOUD)

**You MUST type these declarations before ANY work:**

```
🔍 STARTUP GATE REPORT:
- HOOK status: [ACTIVE 🔴 / IDLE ⚪ / NOT_FOUND]
- Current molecule: [M[N] name / none]
- Task size: [N files] → decompose needed: [YES/NO]
- I will: [continue M[N] / accept new task / create HOOK first]
```

### Gate Logic

| HOOK Status | Files in Task | Your Action |
|-------------|---------------|-------------|
| **ACTIVE 🔴** | Any | Execute CURRENT molecule. Period. |
| **IDLE ⚪** | 1-3 | Work normally |
| **IDLE ⚪** | 4-7 | Create HOOK with molecules FIRST |
| **IDLE ⚪** | 8+ | STOP. `/decompose` is MANDATORY |
| **NOT_FOUND** | >3 | Create `.agent/HOOK.md` FIRST |

---

## 🔴 GUPP: Universal Propulsion Principle

> **"Если на твоём Hook есть работа — ТЫ ОБЯЗАН её выполнить"**
> **"If there's work on your Hook — YOU MUST RUN IT"**

This is NOT a suggestion. This is NOT a best practice.  
**This is THE LAW.**

---

## Your Contract (BINDING)

**You MUST:**
1. ✅ Complete Startup Gate EVERY session
2. ✅ Self-declare status before ANY code
3. ✅ Work ONE molecule at a time
4. ✅ **HARD STOP after each molecule → `git commit`** ← THIS IS NOT OPTIONAL
5. ✅ Handoff at first risk signal

### 🚨 COMMIT CHECKPOINT (AFTER EVERY MOLECULE)

```bash
# Run IMMEDIATELY after completing ANY molecule:
git add . && git commit -m "M[N]: [molecule description]"
```

**If you haven't committed in the last 3 file changes → STOP and commit NOW.**

**You MUST NOT:**
- ❌ Skip Startup Gate
- ❌ Make >5 file changes without commit
- ❌ Ignore existing HOOK.md
- ❌ Work on "entire task" when HOOK exists
- ❌ Say "I'll continue" without declaring molecule
- ❌ **Complete multiple molecules without committing between them**

---

## Handoff Protocol

**Triggers:**
- 10+ tool calls
- 5+ files changed
- Response getting very long

**Execute:**
```bash
git add . && git commit -m "WIP: [molecule] - handoff"
```

**Update HOOK.md:**
- Mark current progress
- Add Handoff Note section
- Specify resume point

**Tell user:**
```
✅ Completed: M1, M2
🔴 Current: M3 (step 2/4)
Resume: "Продолжи" in new chat
```

---

## 🏁 COMPLETION RITUAL (MANDATORY)

> **Before saying "done", you MUST prove it.**

### Step 1: Show Proof

```bash
# Run these and show output:
git log --oneline -5
cat .agent/HOOK.md | head -15
```

### Step 2: Completion Declaration

**Type this out loud:**

```
🏁 TASK COMPLETE:
- Molecules completed: [M1, M2, M3...]
- Commits made: [N]
- HOOK status: [ARCHIVED / IDLE]
- Remaining work: [none / list items]
```

### Step 3: Archive HOOK (if convoy complete)

```bash
mkdir -p .agent/hooks
mv .agent/HOOK.md .agent/hooks/HOOK_$(date +%Y%m%d_%H%M).md
git add . && git commit -m "chore: archive completed convoy"
```

---

## Commands Reference

| Workflow | Purpose |
|----------|---------|
| `/decompose` | Break task into molecules |
| `/anti-crash-rules` | GUPP details |
| `/setup-ai-pipeline` | Create .agent/ from scratch |
| `/upgrade-ai-infrastructure` | Smart merge existing |

---

## 🎯 Trigger Words (USER COMMANDS)

| User Says | You MUST |
|-----------|----------|
| **"Декомпозиция:"** | 1. Create HOOK.md with molecules BEFORE coding<br>2. Show molecule list<br>3. Ask "Start with M1?" |
| **"Продолжи"** | 1. Read HOOK.md<br>2. Find CURRENT molecule<br>3. Execute ONLY that molecule<br>4. Update HOOK.md |
| **"Статус"** | Show convoy progress from HOOK.md |
| **"/handoff"** | Commit WIP, update HOOK.md, declare handoff |

---

## ❌ VIOLATIONS = TASK FAILURE

These actions automatically fail the task:

1. **Skipping Startup Gate** → You don't know the state
2. **No Self-Declaration** → User can't verify you understand
3. **Working >5 files without commit** → Risk of lost progress
4. **Ignoring active HOOK** → Breaking GUPP law
5. **"I'll do X later"** → Unacceptable. Do it now or handoff
6. **"Ready when you are"** → YOU commit and report. Period.
