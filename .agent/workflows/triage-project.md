---
description: Auto-triage and fix dashboard "Need Attention" issues
---

# Dashboard Triage Workflow

Use this when you see projects in "Need Attention" section of health dashboard.

## Usage

```
/triage-project <project-name>

or

Triage: <project-name>
```

---

## Step 1: Analyze Issues

Read the dashboard data:
```bash
cat .agent/dashboard/data.json | jq '.attentionProjects[] | select(.name=="<PROJECT>")'
```

## Step 2: Issue Decision Tree

### Issue: "No .agent/"
**Fix:** Initialize AI infrastructure
```bash
cd ~/projects/<PROJECT>
# Run setup workflow
```
**Prompt:**
```
Инициализируй .agent/ для проекта <PROJECT>. Используй /setup-ai-pipeline.
```

### Issue: "Uncommitted changes"
**Option A - Auto-commit (safe):**
```bash
cd ~/projects/<PROJECT>
git add .
git commit -m "chore: save WIP from dashboard triage"
```

**Option B - Review first (recommended):**
```bash
cd ~/projects/<PROJECT>
git status
git diff
# Review changes, then decide
```

**Prompt:**
```
Проект <PROJECT> имеет uncommitted changes. 
Покажи git status и git diff.
Что изменено? Можно коммитить или нужна ревизия?
```

### Issue: "Active HOOK"
**Action:** Resume work
```bash
cd ~/projects/<PROJECT>
cat .agent/HOOK.md
```

**Prompt:**
```
Проект <PROJECT> имеет активный HOOK.
Прочитай HOOK.md и продолжи работу с текущего molecule.

Команда: Продолжи
```

### Issue: "No git"
**Fix:** Initialize git repository
```bash
cd ~/projects/<PROJECT>
git init
git add .
git commit -m "chore: initial commit from dashboard triage"
```

**Prompt:**
```
Проект <PROJECT> не имеет git.
Инициализируй репозиторий и сделай initial commit.
```

---

## Step 3: Apply Fix

Based on the issue type from Step 2, either:
1. **Auto-fix** (for safe operations like git init, setup .agent/)
2. **Manual review** (for uncommitted changes, active HOOKs)

---

## Step 4: Verify

Run health check again:
```bash
bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh
```

Check if project moved from "Attention" to "Healthy" section.

---

## Full Auto-Triage (Batch Mode)

For multiple projects:
```bash
for project in ~/projects/*/; do
  name=$(basename "$project")
  cd "$project"
  
  # Auto-fix safe issues
  [ ! -d .git ] && git init && git add . && git commit -m "chore: init from triage"
  [ ! -d .agent ] && echo "Manual: run /setup-ai-pipeline in $name"
  
  # Report unsafe issues
  if [ -n "$(git status --short)" ]; then
    echo "⚠️  $name: uncommitted changes"
  fi
  if [ -f .agent/HOOK.md ]; then
    echo "🪝 $name: active HOOK"
  fi
done
```

---

## Example Session

```
USER: Triage: sphere-777

AGENT:
🔍 Analyzing sphere-777...

Issues found:
1. No .agent/ infrastructure
2. Uncommitted changes (3 files)

Recommended actions:
1. Review uncommitted changes first
2. Then initialize .agent/

Starting with git status...
```

---

*Workflow v1.0*
