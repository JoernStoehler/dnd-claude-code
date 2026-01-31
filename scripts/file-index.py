#!/usr/bin/env python3
"""Generate compact file index for agent context.

Produces a compressed overview of the repository structure,
optimized for injecting into Claude's context at session start.
"""

from pathlib import Path
import sys


def format_sessions(campaign_path: Path) -> list[str]:
    """Format session list compactly."""
    sessions_dir = campaign_path / "sessions"
    if not sessions_dir.exists():
        return []

    sessions = sorted(
        [s for s in sessions_dir.glob("*.md") if "template" not in s.name.lower()],
        key=lambda x: x.name
    )
    if not sessions:
        return []

    # Group by type
    hooks = [s for s in sessions if s.name.startswith("hook-")]
    logs = [s for s in sessions if not s.name.startswith("hook-") and not s.name.startswith("_")]

    lines = []
    if logs:
        if len(logs) <= 3:
            names = [s.stem for s in logs]
            lines.append(f"  sessions: {', '.join(names)}")
        else:
            lines.append(f"  sessions: {logs[0].stem} ... {logs[-1].stem} ({len(logs)} total)")

    if hooks:
        hook_names = [s.stem.replace("hook-", "") for s in hooks[:4]]
        suffix = f" +{len(hooks)-4} more" if len(hooks) > 4 else ""
        lines.append(f"  hooks: {', '.join(hook_names)}{suffix}")

    return lines


def format_npcs(campaign_path: Path) -> list[str]:
    """Format NPC list compactly."""
    npcs_dir = campaign_path / "characters" / "npcs"
    if not npcs_dir.exists():
        return []

    npcs = [n for n in npcs_dir.glob("*.md") if "template" not in n.name.lower()]
    if not npcs:
        return []

    names = [n.stem for n in sorted(npcs)[:5]]
    suffix = f" +{len(npcs)-5} more" if len(npcs) > 5 else ""
    return [f"  npcs: {', '.join(names)}{suffix}"]


def format_locations(campaign_path: Path) -> list[str]:
    """Format location list compactly."""
    lore_dir = campaign_path / "lore"
    locations_dir = lore_dir / "locations" if lore_dir.exists() else None

    if not locations_dir or not locations_dir.exists():
        return []

    locations = list(locations_dir.glob("*.md"))
    if not locations:
        return []

    names = [loc.stem for loc in sorted(locations)[:4]]
    suffix = f" +{len(locations)-4} more" if len(locations) > 4 else ""
    return [f"  locations: {', '.join(names)}{suffix}"]


def format_encounters(campaign_path: Path) -> list[str]:
    """Format encounter list compactly."""
    encounters_dir = campaign_path / "encounters"
    if not encounters_dir.exists():
        return []

    encounters = list(encounters_dir.glob("*.md"))
    if not encounters:
        return []

    return [f"  encounters: {len(encounters)} defined"]


def main():
    # Find repo root
    if len(sys.argv) > 1:
        root = Path(sys.argv[1])
    else:
        root = Path(__file__).parent.parent

    print("[File Index]")
    print()

    # Campaigns
    campaigns_dir = root / "campaigns"
    if campaigns_dir.exists():
        for campaign in sorted(campaigns_dir.iterdir()):
            if not campaign.is_dir():
                continue
            if campaign.name == "example":
                continue

            # Check for campaign CLAUDE.md to confirm it's a real campaign
            if not (campaign / "CLAUDE.md").exists():
                continue

            print(f"Campaign: {campaign.name}")

            for line in format_sessions(campaign):
                print(line)
            for line in format_npcs(campaign):
                print(line)
            for line in format_locations(campaign):
                print(line)
            for line in format_encounters(campaign):
                print(line)

            # Progress file
            if (campaign / "PROGRESS.md").exists():
                print(f"  progress: {campaign.name}/PROGRESS.md")

            print()

    # Skills and agents
    claude_dir = root / ".claude"
    skills = list((claude_dir / "skills").glob("*/SKILL.md")) if (claude_dir / "skills").exists() else []
    agents = [a for a in (claude_dir / "agents").glob("*.md") if a.name != "README.md"] if (claude_dir / "agents").exists() else []

    if skills or agents:
        print("Claude Config:")
        if skills:
            names = sorted([s.parent.name for s in skills])
            print(f"  skills: {', '.join(names)}")
        if agents:
            names = sorted([a.stem for a in agents])
            print(f"  agents: {', '.join(names)}")
        print()

    # Packages
    packages_dir = root / "packages"
    if packages_dir.exists():
        pkg_names = set()
        for pkg in packages_dir.iterdir():
            if pkg.is_dir() and (pkg / "package.json").exists() or (pkg / "CLAUDE.md").exists():
                pkg_names.add(pkg.name)
        if pkg_names:
            print(f"Packages: {', '.join(sorted(pkg_names))}")
            print()

    # Docs
    docs_dir = root / "docs"
    if docs_dir.exists():
        doc_count = len(list(docs_dir.rglob("*.md")))
        if doc_count > 0:
            subdirs = [d.name for d in docs_dir.iterdir() if d.is_dir()]
            if subdirs:
                print(f"Docs: {', '.join(sorted(subdirs))} ({doc_count} files)")
            else:
                print(f"Docs: {doc_count} files")
            print()


if __name__ == "__main__":
    main()
