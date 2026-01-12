#!/bin/bash
# install-hooks.sh — Install git hooks for .agent/ automation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "📦 Installing git hooks..."

# Pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'HOOK'
#!/bin/bash
# Pre-commit hook: Auto-update docs-index.md when .agent/ changes

AGENT_CHANGES=$(git diff --cached --name-only | grep -E '^\.agent/' || true)

if [[ -n "$AGENT_CHANGES" ]]; then
    if [[ -x ".agent/scripts/generate-docs-index.sh" ]]; then
        bash .agent/scripts/generate-docs-index.sh
        git add .agent/docs-index.md 2>/dev/null || true
        echo "📚 docs-index.md auto-updated"
    fi
fi

exit 0
HOOK

chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Hooks installed:"
echo "   - pre-commit (auto-update docs-index.md)"
