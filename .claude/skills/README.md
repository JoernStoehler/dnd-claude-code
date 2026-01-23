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

## Current Skills

| Skill | Purpose |
|-------|---------|
| `create-skill` | Meta-skill: how to create new skills |
| `create-agent` | Meta-skill: how to create new agents |

## Proposed Skills for This Project

### Meta / Repository Management
- [x] `create-skill` - How to add new skills
- [x] `create-agent` - How to add new agents
- [ ] `campaign-setup` - How to create a new campaign directory structure

### Content Templates
- [ ] `npc-template` - Standard NPC documentation format
- [ ] `location-template` - Standard location documentation format
- [ ] `session-log-template` - Standard session log format
- [ ] `encounter-template` - Standard encounter documentation format

### Workflows
- [ ] `session-prep` - Checklist for preparing a game session
- [ ] `post-session` - Checklist for after-session tasks (logging, updates)
- [ ] `image-generation` - How to generate images using external AI tools

### Reference Knowledge
- [ ] `writing-style` - Prose conventions for this project
- [ ] `campaign-conventions` - Project-wide conventions beyond CLAUDE.md

## Creating New Skills

1. Identify knowledge or workflow that's reused across tasks
2. Run `/create-skill` or manually create directory
3. Write SKILL.md with clear description and instructions
4. Move large reference material to `references/` subdirectory
5. Test with `/skill-name` invocation
