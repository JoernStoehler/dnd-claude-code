# Custom Agents

This directory contains reusable agent prompts for Task() subagent delegation.

## Official Documentation

- **Primary**: https://code.claude.com/docs/en/sub-agents.md
- **Best Practices**: https://code.claude.com/docs/en/best-practices.md

## How Agents Work

Claude automatically delegates to custom agents based on their descriptions. When a task matches an agent's description, Claude spawns a subagent with:
- Isolated context (doesn't pollute main conversation)
- Specified tool access
- The agent's system prompt

## File Format

Each `.md` file defines one agent:

```yaml
---
name: agent-name
description: What it does and when to use it
tools: Read, Grep, Glob           # Optional: restrict tools
model: sonnet                      # Optional: sonnet/opus/haiku/inherit
permissionMode: default            # Optional: permission handling
---

System prompt for the agent.
```

See `/create-agent` skill for full documentation.

## Built-in Subagent Types

Before creating a custom agent, check if a built-in type works:

| Type | Best For |
|------|----------|
| `Explore` | Codebase search, finding files, answering questions |
| `Plan` | Architecture decisions, implementation planning |
| `Bash` | Running commands in isolated context |
| `general-purpose` | Complex multi-step tasks needing all tools |

## Current Agents

| Agent | Purpose |
|-------|---------|
| `lore-checker` | Verify consistency across campaign materials |
| `create-npc` | Generate NPCs (may generalize to other entities) |

## When to Create Agents vs Use Templates

**Agents** are for tasks requiring:
- Multi-step workflows with judgment calls
- Searching/reading multiple files for context
- Producing output that varies significantly based on context

**Template files** (in campaign directories) work better for:
- Standard formats where the structure is fixed
- Checklists that agents fill in
- Entity types that are similar enough to share a template

The `create-npc` agent exists because NPC creation benefits from gathering campaign context, checking existing characters, and making design decisions. Simpler entity types (factions, locations) may just need template files + checklists.

## Planned Agents

- [ ] `rules-lookup` - Find and verify game rules from reference materials (read-only, useful for mechanical questions)

Add others as genuine needs arise rather than preemptively.

## Creating New Agents

1. Identify a recurring task that benefits from isolated context
2. Run `/create-agent` or manually create `<name>.md`
3. Write focused description with trigger conditions
4. Specify minimal required tools
5. Define clear workflow steps
6. Test via natural delegation
