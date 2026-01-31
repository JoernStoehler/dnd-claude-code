#!/bin/bash
# Session start hook for dnd-claude-code
# Injects context and handles CCWeb-specific setup
set -e

# Read hook input to check source
hook_input=$(cat)
source=$(echo "$hook_input" | jq -r '.source // "startup"')

# Only run on fresh startup, not resume/compact/clear
[ "$source" != "startup" ] && exit 0

# Campaign overview via file-index.py (single source of truth)
echo "=== Repository Overview ==="
python3 "$CLAUDE_PROJECT_DIR/scripts/file-index.py" "$CLAUDE_PROJECT_DIR"

# Available skills (CCWeb workaround - skills don't auto-load)
echo "=== Available Skills ==="
for skill_dir in "$CLAUDE_PROJECT_DIR"/.claude/skills/*/; do
    if [ -f "$skill_dir/SKILL.md" ]; then
        skill_name=$(basename "$skill_dir")
        # Extract description: try YAML frontmatter first, then first non-empty line after heading
        desc=$(grep -m1 '^description:' "$skill_dir/SKILL.md" 2>/dev/null | sed 's/description: *//' | tr -d '"')
        if [ -z "$desc" ]; then
            # Fallback: first non-blank line after the first heading
            desc=$(awk '/^# /{found=1; next} found && /^[^#]/ && !/^$/ {print; exit}' "$skill_dir/SKILL.md" 2>/dev/null)
        fi
        if [ -n "$desc" ]; then
            echo "- $skill_name: $desc"
        else
            echo "- $skill_name: (no description)"
        fi
    fi
done
echo ""

# Available agents
echo "=== Available Agents ==="
for agent_file in "$CLAUDE_PROJECT_DIR"/.claude/agents/*.md; do
    [ ! -f "$agent_file" ] && continue
    agent_name=$(basename "$agent_file" .md)
    [ "$agent_name" = "README" ] && continue
    # Extract description from frontmatter
    desc=$(grep -m1 '^description:' "$agent_file" 2>/dev/null | sed 's/description: *//' | tr -d '"')
    if [ -n "$desc" ]; then
        echo "- $agent_name: $desc"
    else
        echo "- $agent_name: (no description)"
    fi
done
echo ""

# CCWeb-specific setup
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
    echo "=== CCWeb Environment ==="

    # Install gh CLI if needed
    if ! command -v gh &>/dev/null; then
        echo "[Installing gh CLI...]"
        curl -sL https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_linux_amd64.tar.gz -o /tmp/gh.tar.gz 2>/dev/null
        tar -xzf /tmp/gh.tar.gz -C /tmp 2>/dev/null
        sudo cp /tmp/gh_2.63.2_linux_amd64/bin/gh /usr/local/bin/ 2>/dev/null
        echo "[gh CLI installed]"
    else
        echo "gh CLI: available"
    fi
    echo ""
fi

echo "=== End Session Start ==="
