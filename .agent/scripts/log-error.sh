#!/bin/bash
# ============================================================================
# log-error.sh — Error Journaling for Living Memory System
# ============================================================================
#
# PURPOSE:
# Captures errors and failures from human-agent collaboration into a 
# structured journal. Part of the "Living Memory" system — OPTIMI's approach
# to learning from mistakes and preventing recurring issues.
#
# PHILOSOPHY:
# Every error is a learning opportunity. By systematically documenting:
# - WHAT happened (symptoms, not just error messages)
# - WHY it happened (root cause analysis)
# - WHAT we learned (prevention patterns)
# We build organizational memory that transcends individual sessions.
#
# ERROR CATEGORIES TRACKED:
# 1. Agent limitations — AI misunderstands context or makes wrong assumptions
# 2. Human oversight — User provides incomplete/wrong instructions
# 3. Tooling failures — Infrastructure, deployment, or framework bugs
# 4. Communication gaps — Misaligned expectations between human and agent
# 5. Context overflow — Agent "forgot" earlier discussion (LLM memory limit)
# 6. Hallucination — Agent invented non-existent API/file/feature
# 7. Regression — Fix broke something that previously worked
# 8. Scope creep — Asked for X, agent did X + Y + Z unasked
# 9. Silent failure — No error shown but result is wrong
#
# JOURNAL FORMAT:
# Creates structured Markdown entries in docs/memory/journal/YYYY-MM.md
# with auto-incrementing ERR-XXX identifiers for easy reference.
#
# USAGE:
#   Interactive:   bash log-error.sh
#   With params:   bash log-error.sh --project "point-g" --agent "Claude Code" --title "DB migration failed"
#
# INTEGRATION:
# - Dashboard button "📝 Log Error" copies this command to clipboard
# - Can be called from any terminal session
# - Entries are git-tracked and searchable
#
# ============================================================================

set -e

OPTIMI_PATH="${OPTIMI_PATH:-$HOME/projects/optimi-mac}"
JOURNAL_DIR="$OPTIMI_PATH/docs/memory/journal"
CURRENT_MONTH=$(date +%Y-%m)
JOURNAL_FILE="$JOURNAL_DIR/$CURRENT_MONTH.md"
DATE_TODAY=$(date +%Y-%m-%d)

# Defaults
PROJECT=""
AGENT=""
TITLE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project)
            PROJECT="$2"
            shift 2
            ;;
        --agent)
            AGENT="$2"
            shift 2
            ;;
        --title)
            TITLE="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Create journal file if doesn't exist
if [[ ! -f "$JOURNAL_FILE" ]]; then
    cat > "$JOURNAL_FILE" << EOF
# Error Journal: $(date +"%B %Y")

---

EOF
fi

# Count existing errors to generate ID
ERROR_COUNT=$(grep -c "^## ERR-" "$JOURNAL_FILE" 2>/dev/null || echo "0")
NEXT_ID=$(printf "%03d" $((ERROR_COUNT + 1)))

# Interactive prompts if not provided
if [[ -z "$TITLE" ]]; then
    echo "📝 Log Error to Living Memory"
    echo "=============================="
    echo ""
    read -p "Error title (short description): " TITLE
fi

if [[ -z "$PROJECT" ]]; then
    read -p "Project name: " PROJECT
fi

if [[ -z "$AGENT" ]]; then
    echo "Agent (1=Claude Code, 2=Cursor, 3=Antigravity, 4=Other): "
    read -p "> " AGENT_CHOICE
    case $AGENT_CHOICE in
        1) AGENT="Claude Code" ;;
        2) AGENT="Cursor" ;;
        3) AGENT="Antigravity" ;;
        *) read -p "Agent name: " AGENT ;;
    esac
fi

# Error type selection
echo ""
echo "Error type:"
echo "  1) Agent limitations    — AI misunderstood context"
echo "  2) Human oversight       — Incomplete instructions"
echo "  3) Tooling failures      — Infra/framework bug"
echo "  4) Communication gaps    — Misaligned expectations"
echo "  5) Context overflow      — Agent forgot earlier context"
echo "  6) Hallucination         — Agent invented something"
echo "  7) Regression            — Fix broke other things"
echo "  8) Scope creep           — Agent did too much"
echo "  9) Silent failure        — Wrong result, no error"
read -p "> " ERROR_TYPE_CHOICE
case $ERROR_TYPE_CHOICE in
    1) ERROR_TYPE="Agent limitations" ;;
    2) ERROR_TYPE="Human oversight" ;;
    3) ERROR_TYPE="Tooling failures" ;;
    4) ERROR_TYPE="Communication gaps" ;;
    5) ERROR_TYPE="Context overflow" ;;
    6) ERROR_TYPE="Hallucination" ;;
    7) ERROR_TYPE="Regression" ;;
    8) ERROR_TYPE="Scope creep" ;;
    9) ERROR_TYPE="Silent failure" ;;
    *) ERROR_TYPE="Other" ;;
esac

echo ""
echo "What happened? (end with empty line):"
DESCRIPTION=""
while IFS= read -r line; do
    [[ -z "$line" ]] && break
    DESCRIPTION+="$line\n"
done

echo ""
echo "Root cause? (end with empty line):"
ROOT_CAUSE=""
while IFS= read -r line; do
    [[ -z "$line" ]] && break
    ROOT_CAUSE+="$line\n"
done

echo ""
read -p "Lesson learned: " LESSON

echo ""
read -p "Tags (space-separated, e.g., railway deployment env): " TAGS_INPUT
TAGS=$(echo "$TAGS_INPUT" | sed 's/ / #/g' | sed 's/^/#/')

# Append entry
cat >> "$JOURNAL_FILE" << EOF

## ERR-$NEXT_ID: $TITLE

**Date:** $DATE_TODAY
**Project:** $PROJECT
**Agent:** $AGENT
**Type:** $ERROR_TYPE

**Что случилось:**
$(echo -e "$DESCRIPTION")

**Почему:**
$(echo -e "$ROOT_CAUSE")

**Урок:**
$LESSON

**Tags:** $TAGS

---
EOF

echo ""
echo "✅ Logged as ERR-$NEXT_ID in $JOURNAL_FILE"
echo ""
echo "📌 Entry preview:"
echo "   ## ERR-$NEXT_ID: $TITLE"
echo "   Project: $PROJECT | Agent: $AGENT"
echo "   Tags: $TAGS"
