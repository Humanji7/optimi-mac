#!/bin/bash
#
# 🌙 Night Watch — Safe Overnight Refactoring (Smart Delegate Edition)
#
# Uses SMART DELEGATE pattern:
# - Bash script plans (determines files to refactor)
# - Sonnet executes (does the actual refactoring)
# - Cost savings: ~60-70% compared to Opus-only
#
# Runs code-simplifier subagent on selected "Working" projects
# All changes go to separate branches for morning review
#
# Usage:
#   bash night-watch.sh [--dry-run] [project1 project2 ...]
#   bash night-watch.sh pointg                    # Single project
#   bash night-watch.sh --dry-run pointg sphere-777  # Dry run on specific projects
#

set -e

# Config
PROJECTS_DIR="$HOME/projects"
DATA_JSON="$PROJECTS_DIR/optimi-mac/.agent/dashboard/data.json"
SIMPLIFIER_PROMPT="$HOME/.claude/commands/code-simplifier/simplify.md"
LOG_FILE="$PROJECTS_DIR/optimi-mac/.agent/logs/night-watch-$(date +%Y%m%d).log"
DRY_RUN=false
MAX_FILES_PER_PROJECT=3  # Safety limit
SELECTED_PROJECTS=()

# Parse args
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            echo "🔍 DRY RUN MODE — no actual changes will be made"
            shift
            ;;
        *)
            SELECTED_PROJECTS+=("$1")
            shift
            ;;
    esac
done

# Create logs dir
mkdir -p "$(dirname "$LOG_FILE")"

# Start logging
echo "🌙 Night Watch started at $(date)" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

# Check dependencies
if ! command -v claude &> /dev/null; then
    echo "❌ Error: claude CLI not found" | tee -a "$LOG_FILE"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq not found. Install with: brew install jq" | tee -a "$LOG_FILE"
    exit 1
fi

if [[ ! -f "$DATA_JSON" ]]; then
    echo "❌ Error: data.json not found at $DATA_JSON" | tee -a "$LOG_FILE"
    echo "   Run projects-health-check.sh first" | tee -a "$LOG_FILE"
    exit 1
fi

if [[ ! -f "$SIMPLIFIER_PROMPT" ]]; then
    echo "❌ Error: code-simplifier not found at $SIMPLIFIER_PROMPT" | tee -a "$LOG_FILE"
    exit 1
fi

# Determine which projects to process
if [[ ${#SELECTED_PROJECTS[@]} -gt 0 ]]; then
    # Use provided project names
    WORKING_PROJECTS="${SELECTED_PROJECTS[*]}"
    echo "📋 Selected projects:" | tee -a "$LOG_FILE"
else
    # Get all working projects from dashboard data
    WORKING_PROJECTS=$(jq -r '.workingProjects[]?.name // empty' "$DATA_JSON" 2>/dev/null)
    echo "📋 Found working projects:" | tee -a "$LOG_FILE"
fi

if [[ -z "$WORKING_PROJECTS" ]]; then
    echo "✅ No projects to process" | tee -a "$LOG_FILE"
    exit 0
fi

echo "$WORKING_PROJECTS" | tr ' ' '\n' | while read -r name; do 
    [[ -n "$name" ]] && echo "   - $name"
done | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Process each project
BRANCH_NAME="refactor/night-watch-$(date +%Y%m%d)"

for PROJECT in $WORKING_PROJECTS; do
    PROJECT_PATH="$PROJECTS_DIR/$PROJECT"
    
    echo "🌙 Processing: $PROJECT" | tee -a "$LOG_FILE"
    
    # Check project exists
    if [[ ! -d "$PROJECT_PATH" ]]; then
        echo "   ⚠️ Directory not found, skipping" | tee -a "$LOG_FILE"
        continue
    fi
    
    # Check it's a git repo
    if [[ ! -d "$PROJECT_PATH/.git" ]]; then
        echo "   ⚠️ Not a git repo, skipping" | tee -a "$LOG_FILE"
        continue
    fi
    
    cd "$PROJECT_PATH"
    
    # Get recent changes - ONLY code files (filter out images, docs, etc.)
    CODE_EXTENSIONS="js|ts|tsx|jsx|py|rb|go|rs|java|c|cpp|h|hpp|css|scss|sass|less|vue|svelte|php|sh|bash|zsh"
    CHANGED_FILES=$(git diff --name-only HEAD~5 2>/dev/null | grep -E "\.($CODE_EXTENSIONS)$" | head -n $MAX_FILES_PER_PROJECT)
    
    if [[ -z "$CHANGED_FILES" ]]; then
        echo "   ℹ️ No code files changed recently, skipping" | tee -a "$LOG_FILE"
        continue
    fi
    
    echo "   📄 Files to simplify:" | tee -a "$LOG_FILE"
    echo "$CHANGED_FILES" | while read -r f; do echo "      - $f"; done | tee -a "$LOG_FILE"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "   🔍 [DRY RUN] Would create branch and run code-simplifier" | tee -a "$LOG_FILE"
        continue
    fi
    
    # Create safety branch
    CURRENT_BRANCH=$(git branch --show-current)
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        git checkout "$BRANCH_NAME" 2>/dev/null
    else
        git checkout -b "$BRANCH_NAME" 2>/dev/null
    fi
    
    echo "   🌿 Branch: $BRANCH_NAME" | tee -a "$LOG_FILE"
    
    # Run code-simplifier (one file at a time for safety)
    for FILE in $CHANGED_FILES; do
        if [[ ! -f "$FILE" ]]; then
            continue
        fi
        
        echo "   🔧 Simplifying: $FILE" | tee -a "$LOG_FILE"
        
        # Run claude with SONNET (Smart Delegate: cheap model for execution)
        # Opus would cost ~5x more for the same task
        timeout 120 claude -p \
            --model sonnet \
            --system-prompt "$(cat "$SIMPLIFIER_PROMPT")" \
            --permission-mode acceptEdits \
            --max-budget-usd 0.30 \
            "Simplify ONLY this file: $FILE. Make minimal, safe improvements for readability. Commit when done with message 'refactor(night): simplify $FILE'. Do NOT touch other files." \
            2>&1 | tee -a "$LOG_FILE" || {
                echo "   ⚠️ Claude timeout or error for $FILE" | tee -a "$LOG_FILE"
            }
        
        # Small delay between files
        sleep 2
    done
    
    # Return to original branch (but keep night-watch branch for review)
    git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout main 2>/dev/null || true
    
    echo "   ✅ $PROJECT done" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
done

echo "---" | tee -a "$LOG_FILE"
echo "🌙 Night Watch completed at $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📋 Review branches in the morning:" | tee -a "$LOG_FILE"
echo "   git log $BRANCH_NAME --oneline" | tee -a "$LOG_FILE"
echo "   git diff main..$BRANCH_NAME" | tee -a "$LOG_FILE"
