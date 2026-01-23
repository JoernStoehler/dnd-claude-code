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

## Proposed Agents for This Project

### Content Creation
- `create-npc` - Generate NPCs with personality, motivation, appearance, stats
- `create-location` - Design locations with description, inhabitants, secrets
- `create-encounter` - Build balanced encounters (combat, social, exploration)
- `create-faction` - Develop factions with goals, resources, relationships

### Quality Assurance
- `lore-checker` - Verify consistency across campaign materials
- `session-reviewer` - Check session logs for completeness and clarity
- `rules-lookup` - Find and verify game rules from reference materials

### Utilities
- `image-prompter` - Generate prompts for text-to-image AI tools
- `summarizer` - Create concise summaries of lengthy materials
- `index-builder` - Generate indices and cross-references

## Creating New Agents

1. Identify a recurring delegatable task
2. Run `/create-agent` or manually create `<name>.md`
3. Write focused description with trigger conditions
4. Specify minimal required tools
5. Define clear workflow steps
6. Test via natural delegation or explicit Task() call
