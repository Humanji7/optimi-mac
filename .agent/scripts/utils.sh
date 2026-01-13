#!/bin/bash
set -euo pipefail

# =============================================================================
# Common utilities for .agent scripts
# =============================================================================
# Purpose: Shared functions for logging, validation, and constants
# Usage: source "$(dirname "$0")/utils.sh"
# =============================================================================

# -----------------------------------------------------------------------------
# Constants
# -----------------------------------------------------------------------------
readonly PROJECTS_DIR="${HOME}/projects"

# -----------------------------------------------------------------------------
# Colors
# -----------------------------------------------------------------------------
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Logging Functions
# -----------------------------------------------------------------------------

# Print success message with green checkmark
# Usage: log_pass "Operation completed"
log_pass() {
    echo -e "${GREEN}✓${NC} $*"
}

# Print error message with red cross
# Usage: log_fail "Operation failed"
log_fail() {
    echo -e "${RED}✗${NC} $*" >&2
}

# Print warning message with yellow indicator
# Usage: log_warn "This is a warning"
log_warn() {
    echo -e "${YELLOW}⚠${NC} $*" >&2
}

# Print info message with blue indicator
# Usage: log_info "Processing data"
log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

# Print section header with cyan color
# Usage: log_header "Validation Phase"
log_header() {
    echo -e "\n${CYAN}▶${NC} ${CYAN}$*${NC}"
}

# -----------------------------------------------------------------------------
# Validation Functions
# -----------------------------------------------------------------------------

# Validate that project exists and is a directory
# Usage: validate_project "optimi-mac"
# Returns: 0 if valid, 1 if invalid (with error message)
validate_project() {
    local project_name="$1"
    local project_path="${PROJECTS_DIR}/${project_name}"

    if [[ -z "$project_name" ]]; then
        log_fail "Project name is required"
        return 1
    fi

    if [[ ! -d "$project_path" ]]; then
        log_fail "Project not found: ${project_path}"
        return 1
    fi

    return 0
}
