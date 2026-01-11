#!/bin/bash
#
# Smart Status Line with auto-rollover preparation
# Shows context usage + warns at 90% + prepares rollover command
#

# Read JSON from stdin (Claude Code passes context data)
INPUT=$(cat)

# Parse context usage - handle both formats
# Format 1: current_usage is a number
# Format 2: current_usage is an object with token counts
CURRENT_RAW=$(echo "$INPUT" | jq -r '.context_window.current_usage // 0')

if echo "$CURRENT_RAW" | jq -e 'type == "object"' >/dev/null 2>&1; then
    # Object format - sum all tokens
    INPUT_TOKENS=$(echo "$CURRENT_RAW" | jq -r '.input_tokens // 0')
    OUTPUT_TOKENS=$(echo "$CURRENT_RAW" | jq -r '.output_tokens // 0')
    CACHE_CREATE=$(echo "$CURRENT_RAW" | jq -r '.cache_creation_input_tokens // 0')
    CACHE_READ=$(echo "$CURRENT_RAW" | jq -r '.cache_read_input_tokens // 0')
    CURRENT=$((INPUT_TOKENS + OUTPUT_TOKENS + CACHE_CREATE + CACHE_READ))
else
    # Number format
    CURRENT="${CURRENT_RAW:-0}"
fi

MAX=$(echo "$INPUT" | jq -r '.context_window.context_window_size // 200000')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

# Calculate percentage
if [[ "$MAX" -gt 0 && "$CURRENT" -gt 0 ]]; then
    PERCENT=$((CURRENT * 100 / MAX))
else
    PERCENT=0
fi

# Ensure numbers are valid
[[ -z "$CURRENT" || "$CURRENT" == "null" ]] && CURRENT=0
[[ -z "$MAX" || "$MAX" == "null" ]] && MAX=200000
[[ ! "$CURRENT" =~ ^[0-9]+$ ]] && CURRENT=0
[[ ! "$MAX" =~ ^[0-9]+$ ]] && MAX=200000

# Format numbers for display
CURRENT_K=$((CURRENT / 1000))
MAX_K=$((MAX / 1000))

# Save state for external monitoring
STATE_FILE="/tmp/claude-context-state.json"
echo "{\"session_id\":\"$SESSION_ID\",\"percent\":$PERCENT,\"current\":$CURRENT,\"max\":$MAX,\"timestamp\":$(date +%s)}" > "$STATE_FILE"

# Color based on usage
if [[ $PERCENT -ge 90 ]]; then
    # CRITICAL - red background
    COLOR="\033[1;97;41m"  # Bold white on red
    ICON="🚨"
    WARN=" ROLLOVER!"
elif [[ $PERCENT -ge 80 ]]; then
    # WARNING - orange/yellow
    COLOR="\033[1;33m"  # Bold yellow
    ICON="⚠️"
    WARN=""
elif [[ $PERCENT -ge 60 ]]; then
    # CAUTION - light yellow
    COLOR="\033[33m"
    ICON="📊"
    WARN=""
else
    # OK - green
    COLOR="\033[32m"
    ICON="✓"
    WARN=""
fi

RESET="\033[0m"

# Build progress bar (10 chars)
FILLED=$((PERCENT / 10))
[[ $FILLED -gt 10 ]] && FILLED=10
EMPTY=$((10 - FILLED))
[[ $EMPTY -lt 0 ]] && EMPTY=0

BAR=""
for ((i=0; i<FILLED; i++)); do BAR+="█"; done
for ((i=0; i<EMPTY; i++)); do BAR+="░"; done

# Output
echo -e "${COLOR}${ICON} ${PERCENT}% [${BAR}] ${CURRENT_K}k/${MAX_K}k${WARN}${RESET}"

# Sound alert at 90%+ (macOS)
if [[ $PERCENT -ge 90 ]] && [[ "$(uname)" == "Darwin" ]]; then
    ALERT_FLAG="/tmp/claude-alert-${SESSION_ID}"
    if [[ ! -f "$ALERT_FLAG" ]]; then
        afplay /System/Library/Sounds/Sosumi.aiff 2>/dev/null &
        osascript -e "display notification \"Context at ${PERCENT}%! Run: aichat rollover\" with title \"Claude Code\" sound name \"Sosumi\"" 2>/dev/null &
        touch "$ALERT_FLAG"
    fi
fi
