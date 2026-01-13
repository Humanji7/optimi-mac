#!/bin/bash
# ============================================================================
# 🧠 Generate Triage Prompt
# Deep analysis of project → surgical prompt → clipboard
# Usage: bash generate-triage-prompt.sh <project-name>
# ============================================================================

set -e
source "$(dirname "$0")/utils.sh"

PROJECT_NAME="${1:-}"
PROJECT_PATH="$PROJECTS_DIR/$PROJECT_NAME"

if [[ -z "$PROJECT_NAME" ]]; then
    log_fail "Usage: $0 <project-name>"
    exit 1
fi

if [[ ! -d "$PROJECT_PATH" ]]; then
    log_fail "Project not found: $PROJECT_PATH"
    exit 1
fi

cd "$PROJECT_PATH"

# ============================================================================
# Deep Scan
# ============================================================================

ISSUES=()
HAS_AGENT=false
HAS_HOOK=false
HAS_GIT=false
HAS_UNCOMMITTED=false

[[ -d ".agent" ]] && HAS_AGENT=true || ISSUES+=("No .agent/")
[[ -f ".agent/HOOK.md" ]] && HAS_HOOK=true
[[ -d ".git" ]] && HAS_GIT=true || ISSUES+=("No git")

if $HAS_GIT; then
    if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
        HAS_UNCOMMITTED=true
        ISSUES+=("Uncommitted changes")
    fi
fi

# ============================================================================
# Gather Context
# ============================================================================

CONTEXT=""

# Git status (if uncommitted)
if $HAS_UNCOMMITTED; then
    CONTEXT+="### Git Status:\n"
    CONTEXT+="\`\`\`\n$(git status --short | head -20)\n\`\`\`\n\n"
    CONTEXT+="### Changes Summary:\n"
    CONTEXT+="\`\`\`\n$(git diff --stat | tail -10)\n\`\`\`\n\n"
fi

# HOOK.md content (if exists)
if $HAS_HOOK; then
    CONTEXT+="### Active HOOK:\n"
    CONTEXT+="\`\`\`\n$(cat .agent/HOOK.md | head -30)\n\`\`\`\n\n"
fi

# .agent/ structure (if exists)
if $HAS_AGENT; then
    CONTEXT+="### .agent/ structure:\n"
    CONTEXT+="\`\`\`\n$(ls -la .agent/ 2>/dev/null | head -15)\n\`\`\`\n\n"
fi

# Project type detection
if [[ -f "package.json" ]]; then
    CONTEXT+="### Project type: Node.js\n\n"
elif [[ -f "Gemfile" ]]; then
    CONTEXT+="### Project type: Ruby/Rails\n\n"
elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    CONTEXT+="### Project type: Python\n\n"
fi

# ============================================================================
# Generate Prompt
# ============================================================================

PROMPT="Проект: $PROJECT_NAME
Путь: $PROJECT_PATH
Проблемы: ${ISSUES[*]:-Нет}

---

## Контекст (собран автоматически)

$CONTEXT
---

## Инструкция

"

# Priority-based instructions
if $HAS_HOOK; then
    PROMPT+="1. **Продолжи активную работу:** Прочитай HOOK.md выше и продолжи с текущего molecule
"
fi

if ! $HAS_GIT; then
    PROMPT+="1. **Инициализируй git:**
   - \`git init\`
   - Создай .gitignore если нужен
   - \`git add . && git commit -m \"chore: initial commit\"\`
"
fi

if $HAS_UNCOMMITTED; then
    PROMPT+="1. **Разбор uncommitted changes:**
   - Проанализируй изменения выше
   - Объясни что изменено (1-2 строки)
   - Если safe → сделай осмысленный коммит
   - Если требует ревью → укажи что проверить
"
fi

if ! $HAS_AGENT; then
    PROMPT+="1. **Инициализируй .agent/:** Запусти /setup-ai-pipeline
"
fi

PROMPT+="
---

**Ожидаемый результат:** Проект должен переместиться из 'Need Attention' в 'Healthy'
"

# ============================================================================
# Copy to Clipboard
# ============================================================================

echo -e "$PROMPT" | pbcopy

echo "✅ Prompt copied to clipboard!"
echo ""
echo "📋 Preview (first 20 lines):"
echo "---"
echo -e "$PROMPT" | head -20
echo "..."

# Auto-refresh health data after triage
echo ""
echo "🔄 Refreshing health data..."
bash "$(dirname "$0")/projects-health-check.sh" > /dev/null 2>&1 &
echo "✅ Dashboard data updated!"
