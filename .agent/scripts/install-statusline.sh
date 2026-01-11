#!/bin/bash
#
# 📊 Smart StatusLine Installer for Claude Code
# One-click install from optimi-mac dashboard
#
# Usage: curl -fsSL https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.agent/scripts/install-statusline.sh | bash
#

set -e

CLAUDE_DIR="$HOME/.claude"
SCRIPTS_DIR="$CLAUDE_DIR/scripts"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

echo "📊 Installing Smart StatusLine for Claude Code..."
echo ""

# Create directories
mkdir -p "$SCRIPTS_DIR"

# Download statusline script
echo "⬇️  Downloading statusline-smart.sh..."
curl -fsSL "https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.claude/statusline-smart.sh" -o "$CLAUDE_DIR/statusline-smart.sh"
chmod +x "$CLAUDE_DIR/statusline-smart.sh"

# Download auto-rollover script
echo "⬇️  Downloading auto-rollover.sh..."
curl -fsSL "https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.claude/scripts/auto-rollover.sh" -o "$SCRIPTS_DIR/auto-rollover.sh"
chmod +x "$SCRIPTS_DIR/auto-rollover.sh"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install jq
    else
        echo "❌ Please install jq: brew install jq"
        exit 1
    fi
fi

# Update settings.json
echo "⚙️  Configuring Claude Code settings..."

if [[ -f "$SETTINGS_FILE" ]]; then
    # Backup existing settings
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"

    # Check if statusLine already exists
    if jq -e '.statusLine' "$SETTINGS_FILE" > /dev/null 2>&1; then
        # Update existing statusLine
        jq '.statusLine = {"type": "command", "command": "~/.claude/statusline-smart.sh", "padding": 0}' "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp"
        mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
    else
        # Add statusLine
        jq '. + {"statusLine": {"type": "command", "command": "~/.claude/statusline-smart.sh", "padding": 0}}' "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp"
        mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
    fi
else
    # Create new settings file
    cat > "$SETTINGS_FILE" << 'EOF'
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline-smart.sh",
    "padding": 0
  }
}
EOF
fi

# Add alias to shell config
SHELL_RC="$HOME/.zshrc"
[[ -f "$HOME/.bashrc" ]] && SHELL_RC="$HOME/.bashrc"

if ! grep -q "auto-rollover" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Claude Code auto-rollover" >> "$SHELL_RC"
    echo 'alias auto-rollover="~/.claude/scripts/auto-rollover.sh"' >> "$SHELL_RC"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 StatusLine shows:"
echo "   ✓ 45% [████░░░░░░] 90k/200k     (green - OK)"
echo "   ⚠️ 82% [████████░░] 165k/200k   (yellow - caution)"
echo "   🚨 92% [█████████░] 185k/200k   (red + sound alert)"
echo ""
echo "🔄 Commands available:"
echo "   auto-rollover          # Auto rollover when context >90%"
echo "   auto-rollover --check  # Just check current usage"
echo ""
echo "👉 Restart Claude Code to activate!"
