#!/bin/bash
# log-error.sh - Quick error logging to OPTIMI Living Memory journal
# Usage: bash log-error.sh [--project NAME] [--agent NAME] [--title "TITLE"]

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
