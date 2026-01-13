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

# Test helper
run_test() {
    local name="$1"
    local input="$2"
    local expected_decision="$3"
    local expected_reason_contains="${4:-}"

    echo -n "Testing: $name... "

    RESULT=$(echo "$input" | bash "$TARGET_SCRIPT" 2>/dev/null || true)

    if [[ -z "$RESULT" ]]; then
        # Script exited with exit 0 (no output = approved silently)
        if [[ "$expected_decision" == "silent_approve" ]]; then
            echo -e "${GREEN}PASSED${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}FAILED${NC} (expected output, got silent exit)"
            ((FAILED++))
            return 1
        fi
    fi

    DECISION=$(echo "$RESULT" | jq -r '.decision // empty' 2>/dev/null || true)
    REASON=$(echo "$RESULT" | jq -r '.reason // empty' 2>/dev/null || true)

    if [[ "$DECISION" == "$expected_decision" ]]; then
        if [[ -n "$expected_reason_contains" && "$REASON" != *"$expected_reason_contains"* ]]; then
            echo -e "${RED}FAILED${NC} (reason mismatch)"
            echo "  Expected reason to contain: $expected_reason_contains"
            echo "  Got: $REASON"
            ((FAILED++))
            return 1
        fi
        echo -e "${GREEN}PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Expected decision: $expected_decision"
        echo "  Got: $DECISION"
        echo "  Full output: $RESULT"
        ((FAILED++))
        return 1
    fi
}

echo "========================================"
echo "Smart Delegate Hook Tests"
echo "========================================"
echo ""

# Test 1: Non-Task tool should be ignored (silent approve)
run_test "Non-Task tool ignored" \
    '{"tool_name": "Read", "tool_input": {"file_path": "/test"}}' \
    "silent_approve"

# Test 2: Task with explicit sonnet model should pass silently
run_test "Task with sonnet model" \
    '{"tool_name": "Task", "tool_input": {"model": "sonnet", "prompt": "This is a very long prompt that exceeds 200 characters to test the smart delegate detection logic when using the correct model specification for implementation tasks"}}' \
    "silent_approve"

# Test 3: Task with haiku model should pass silently
run_test "Task with haiku model" \
    '{"tool_name": "Task", "tool_input": {"model": "haiku", "prompt": "Another very long prompt that exceeds 200 characters to test the smart delegate detection logic when using haiku model for quick tasks"}}' \
    "silent_approve"

# Test 4: Short prompt with opus (default) should pass silently
run_test "Short prompt with opus" \
    '{"tool_name": "Task", "tool_input": {"prompt": "Short task"}}' \
    "silent_approve"

# Test 5: Long prompt with opus should warn but approve
run_test "Long prompt with opus warns" \
    '{"tool_name": "Task", "tool_input": {"prompt": "This is a very long implementation prompt that exceeds 200 characters and should trigger the Smart Delegate warning because we are using the default Opus model instead of Sonnet which would be more cost-effective"}}' \
    "approve" \
    "Smart Delegate"

# Test 6: Long prompt with explicit opus should warn
run_test "Explicit opus with long prompt warns" \
    '{"tool_name": "Task", "tool_input": {"model": "opus", "prompt": "This is another very long implementation prompt that exceeds 200 characters and explicitly uses opus model which should definitely trigger the Smart Delegate warning mechanism. Adding more text to ensure we pass the threshold limit for testing purposes and verify proper hook behavior."}}' \
    "approve" \
    "Smart Delegate"

# Test 7: Empty tool_input should not crash
run_test "Empty tool_input handled" \
    '{"tool_name": "Task", "tool_input": {}}' \
    "silent_approve"

echo ""
echo "========================================"
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================"

if [[ $FAILED -gt 0 ]]; then
    exit 1
fi
exit 0
