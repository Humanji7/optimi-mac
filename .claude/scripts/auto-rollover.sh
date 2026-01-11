#!/bin/bash
#
# Auto-Rollover Script
# Reads context state and performs rollover if needed
#
# Usage:
#   auto-rollover           # Check and rollover if >90%
#   auto-rollover --force   # Force rollover regardless of usage
#   auto-rollover --check   # Just check, don't rollover
#

STATE_FILE="/tmp/claude-context-state.json"
THRESHOLD=90

# Parse args
FORCE=false
CHECK_ONLY=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --force|-f) FORCE=true; shift ;;
        --check|-c) CHECK_ONLY=true; shift ;;
        --threshold|-t) THRESHOLD="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# Check state file exists
if [[ ! -f "$STATE_FILE" ]]; then
    echo "❌ No active Claude session found"
    echo "   Start a Claude Code session first"
    exit 1
fi

# Read state
STATE=$(cat "$STATE_FILE")
SESSION_ID=$(echo "$STATE" | jq -r '.session_id')
PERCENT=$(echo "$STATE" | jq -r '.percent')
TIMESTAMP=$(echo "$STATE" | jq -r '.timestamp')
CURRENT_TIME=$(date +%s)
AGE=$((CURRENT_TIME - TIMESTAMP))

# Check if state is fresh (< 60 seconds old)
if [[ $AGE -gt 60 ]]; then
    echo "⚠️  State is ${AGE}s old - session may be inactive"
fi

echo "📊 Session: ${SESSION_ID:0:8}..."
echo "📊 Context: ${PERCENT}%"
echo "📊 Threshold: ${THRESHOLD}%"
echo ""

# Check only mode
if [[ "$CHECK_ONLY" == "true" ]]; then
    if [[ $PERCENT -ge $THRESHOLD ]]; then
        echo "🚨 Context above threshold! Run: aichat rollover --quick"
    else
        echo "✅ Context OK"
    fi
    exit 0
fi

# Decide whether to rollover
if [[ "$FORCE" == "true" ]] || [[ $PERCENT -ge $THRESHOLD ]]; then
    echo "🔄 Starting rollover..."
    echo ""

    # Run aichat rollover with quick mode
    aichat rollover --quick "$SESSION_ID"
else
    echo "✅ Context OK (${PERCENT}% < ${THRESHOLD}%)"
    echo "   Use --force to rollover anyway"
fi
