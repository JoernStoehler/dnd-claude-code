# Skills

This directory contains reusable knowledge and workflows for Claude Code agents.

## Official Documentation

- **Primary**: https://code.claude.com/docs/en/skills.md
- **Best Practices**: https://code.claude.com/docs/en/best-practices.md

## How Skills Work

Skills provide progressive disclosure of knowledge:
1. **Description** (YAML frontmatter) - Always loaded, tells Claude when to use the skill
2. **Body** (markdown content) - Loaded when skill is invoked
3. **References** (separate files) - Loaded on demand when Claude needs details

## When to Use Skills vs Templates

**Skills** are for procedural knowledge that agents need to discover and follow:
- Workflows with multiple steps and decision points
- Best practices that evolve over time
- Knowledge that applies across different contexts

**Template files** (in campaign directories) are for standard formats:
- NPC sheets, location docs, session logs
- Agents find these by filename/location, no progressive disclosure needed
- Just artifacts in standard locations

## Current Skills

| Skill | Purpose |
|-------|---------|
| `create-skill` | Meta-skill: how to create new skills |
| `create-agent` | Meta-skill: how to create new agents |

## Planned Skills

### Workflows (to be built as we learn best practices)
- [ ] `session-prep` - Checklist for preparing a game session
- [ ] `post-session` - Checklist for after-session tasks (logging, updates, lore verification)

### Reference (add when needed)
- [ ] `image-generation` - How to generate images using external AI tools
- [ ] `writing-style` - Prose conventions for this project (if we settle on conventions)

## Creating New Skills

1. Identify knowledge or workflow that's reused across tasks
2. Run `/create-skill` or manually create directory
3. Write SKILL.md with clear description and instructions
4. Move large reference material to `references/` subdirectory
5. Test with `/skill-name` invocation
