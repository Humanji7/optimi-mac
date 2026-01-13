#!/bin/bash
# check-smart-delegate.sh — PreToolUse hook for Task tool
# Auto-switches opus → sonnet for long prompts (>200 chars)

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

# Log file
LOG_FILE="$HOME/.claude/smart-delegate-log.txt"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Task: model=$MODEL, prompt_length=$PROMPT_LENGTH" >> "$LOG_FILE"

# Check: if prompt is long (likely implementation) and model is opus (default)
if [[ $PROMPT_LENGTH -gt 200 ]] && [[ "$MODEL" == "opus" ]]; then
    # AUTO-REPLACE: opus → sonnet
    echo "🔄 AUTO-SWITCH: opus → sonnet ($PROMPT_LENGTH chars)" >> "$LOG_FILE"

    # Build updatedInput with model: sonnet (keep all other fields)
    UPDATED_INPUT=$(echo "$TOOL_INPUT" | jq '. + {model: "sonnet"}')

    # Return JSON with updatedInput — Claude Code will use new model
    jq -n \
        --argjson updated "$UPDATED_INPUT" \
        '{
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "allow",
                permissionDecisionReason: "🔄 Smart Delegate: auto-switched to sonnet",
                updatedInput: $updated
            }
        }'
    exit 0
fi

# All good — no changes needed
exit 0
