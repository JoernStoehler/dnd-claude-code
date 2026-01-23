# Agent Prompts

This directory contains reusable prompts for `Task()` subagents.

## Usage

Each `.md` file defines a specialized agent for a common task. To use:

```
Task(prompt="<contents of agent file> + <specific task details>", subagent_type="general-purpose")
```

## Creating New Agents

1. Identify a recurring task pattern
2. Write a prompt that:
   - Explains the task context
   - Lists specific steps to follow
   - Defines expected output format
   - Notes common pitfalls to avoid
3. Save as `<task-name>.md`

## Planned Agents

- `create-npc.md` - Generate NPC with personality, motivation, stats
- `design-encounter.md` - Build balanced combat or social encounter
- `image-prompt.md` - Generate prompts for text-to-image tools
- `session-summary.md` - Convert session notes to structured log
