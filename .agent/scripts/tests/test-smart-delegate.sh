#!/bin/bash
# test-smart-delegate.sh — Unit tests for check-smart-delegate.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="$SCRIPT_DIR/../check-smart-delegate.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test helper for silent approve (no output)
test_silent() {
    local name="$1"
    local input="$2"

    echo -n "Testing: $name... "
    RESULT=$(echo "$input" | bash "$TARGET_SCRIPT" 2>/dev/null || true)

    if [[ -z "$RESULT" ]]; then
        echo -e "${GREEN}PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAILED${NC} (expected no output)"
        echo "  Got: $RESULT"
        ((FAILED++))
        return 1
    fi
}

# Test helper for auto-switch (model changed to sonnet)
test_auto_switch() {
    local name="$1"
    local input="$2"

    echo -n "Testing: $name... "
    RESULT=$(echo "$input" | bash "$TARGET_SCRIPT" 2>/dev/null || true)

    if [[ -z "$RESULT" ]]; then
        echo -e "${RED}FAILED${NC} (expected auto-switch output)"
        ((FAILED++))
        return 1
    fi

    DECISION=$(echo "$RESULT" | jq -r '.hookSpecificOutput.permissionDecision // empty' 2>/dev/null || true)
    NEW_MODEL=$(echo "$RESULT" | jq -r '.hookSpecificOutput.updatedInput.model // empty' 2>/dev/null || true)

    if [[ "$DECISION" == "allow" && "$NEW_MODEL" == "sonnet" ]]; then
        echo -e "${GREEN}PASSED${NC} (→ sonnet)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Expected: decision=allow, model=sonnet"
        echo "  Got: decision=$DECISION, model=$NEW_MODEL"
        ((FAILED++))
        return 1
    fi
}

echo "========================================"
echo "Smart Delegate Hook Tests"
echo "========================================"
echo ""

# Test 1: Non-Task tool should be ignored (silent)
test_silent "Non-Task tool ignored" \
    '{"tool_name": "Read", "tool_input": {"file_path": "/test"}}'

# Test 2: Task with sonnet model should pass silently (already optimal)
test_silent "Task with sonnet" \
    '{"tool_name": "Task", "tool_input": {"model": "sonnet", "prompt": "This is a very long prompt that exceeds 200 characters to test the smart delegate detection logic when using the correct model"}}'

# Test 3: Task with haiku model should pass silently
test_silent "Task with haiku" \
    '{"tool_name": "Task", "tool_input": {"model": "haiku", "prompt": "Another very long prompt that exceeds 200 characters to test the smart delegate detection logic when using haiku model"}}'

# Test 4: Short prompt with opus should pass silently (no need to switch)
test_silent "Short prompt with opus" \
    '{"tool_name": "Task", "tool_input": {"prompt": "Short task"}}'

# Test 5: Long prompt with opus → AUTO-SWITCH to sonnet
test_auto_switch "Long prompt → auto-switch" \
    '{"tool_name": "Task", "tool_input": {"prompt": "This is a very long implementation prompt that exceeds 200 characters and should trigger automatic model switching from opus to sonnet for cost optimization and efficiency purposes. We need more text here to ensure threshold is passed."}}'

# Test 6: Explicit opus with long prompt → AUTO-SWITCH
test_auto_switch "Explicit opus → auto-switch" \
    '{"tool_name": "Task", "tool_input": {"model": "opus", "prompt": "This is another very long implementation prompt that exceeds 200 characters and explicitly uses opus model which should definitely trigger the Smart Delegate auto-switch mechanism to sonnet. Adding extra padding text."}}'

# Test 7: Empty tool_input should not crash
test_silent "Empty tool_input handled" \
    '{"tool_name": "Task", "tool_input": {}}'

# Test 8: Verify all original fields preserved after switch
echo -n "Testing: Fields preserved after switch... "
INPUT='{"tool_name": "Task", "tool_input": {"prompt": "Long prompt exceeding 200 characters for testing field preservation during model auto-switch from opus to sonnet in the smart delegate hook mechanism. Adding more text to ensure we exceed the threshold limit.", "subagent_type": "Explore", "description": "My task", "custom_field": "preserved"}}'
RESULT=$(echo "$INPUT" | bash "$TARGET_SCRIPT" 2>/dev/null || true)
PRESERVED=$(echo "$RESULT" | jq -r '.hookSpecificOutput.updatedInput.custom_field // empty' 2>/dev/null || true)
SUBAGENT=$(echo "$RESULT" | jq -r '.hookSpecificOutput.updatedInput.subagent_type // empty' 2>/dev/null || true)

if [[ "$PRESERVED" == "preserved" && "$SUBAGENT" == "Explore" ]]; then
    echo -e "${GREEN}PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAILED${NC}"
    echo "  Expected custom_field=preserved, subagent_type=Explore"
    echo "  Got: custom_field=$PRESERVED, subagent_type=$SUBAGENT"
    ((FAILED++))
fi

echo ""
echo "========================================"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================"

if [[ $FAILED -gt 0 ]]; then
    exit 1
fi
exit 0
