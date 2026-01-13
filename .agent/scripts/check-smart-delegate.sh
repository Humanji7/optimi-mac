#!/bin/bash
# check-smart-delegate.sh — PreToolUse hook for Task tool
# Warns if Task is called without model: sonnet/haiku for implementation

set -euo pipefail

# Read input from stdin (JSON with tool_name and tool_input)
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# Only check Task tool
if [[ "$TOOL_NAME" != "Task" ]]; then
    exit 0
fi

# Extract model from tool_input
MODEL=$(echo "$TOOL_INPUT" | jq -r '.model // "opus"')
PROMPT=$(echo "$TOOL_INPUT" | jq -r '.prompt // ""')
PROMPT_LENGTH=${#PROMPT}

# Log for debugging
LOG_FILE="$HOME/.claude/smart-delegate-log.txt"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Task called: model=$MODEL, prompt_length=$PROMPT_LENGTH" >> "$LOG_FILE"

# Check: if prompt is long (likely implementation) and model is not sonnet/haiku
if [[ $PROMPT_LENGTH -gt 200 ]] && [[ "$MODEL" == "opus" ]]; then
    # Warning but don't block
    echo "⚠️ SMART DELEGATE: Task с длинным промптом ($PROMPT_LENGTH chars) использует Opus." >> "$LOG_FILE"
    echo "   Рекомендуется: model: \"sonnet\" для экономии токенов." >> "$LOG_FILE"

    # Return JSON with reason (non-blocking warning)
    echo '{"decision": "approve", "reason": "⚠️ Smart Delegate: Consider using model: sonnet for implementation tasks"}'
    exit 0
fi

# All good
exit 0
