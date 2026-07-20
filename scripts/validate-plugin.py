#!/usr/bin/env python3
"""Portable repository checks for the Manse Codex plugin.

The built-in Codex validators remain the authoritative local development tools.
This script keeps the public repository CI useful without depending on a user's
Codex installation.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "manse-creator"
MANIFEST = PLUGIN / ".codex-plugin" / "plugin.json"
MARKETPLACE = ROOT / ".agents" / "plugins" / "marketplace.json"
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def fail(message: str) -> None:
    print(f"plugin validation: {message}", file=sys.stderr)
    raise SystemExit(1)


def read_json(path: Path) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing {path.relative_to(ROOT)}")
    except json.JSONDecodeError as error:
        fail(f"invalid JSON in {path.relative_to(ROOT)}: {error}")


def parse_skill_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if "[TODO:" in text or "TODO:" in text:
        fail(f"placeholder remains in {path.relative_to(ROOT)}")
    if not text.startswith("---\n"):
        fail(f"missing YAML frontmatter in {path.relative_to(ROOT)}")
    try:
        block = text.split("---\n", 2)[1]
    except IndexError:
        fail(f"unterminated YAML frontmatter in {path.relative_to(ROOT)}")

    values: dict[str, str] = {}
    for raw_line in block.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            fail(f"unsupported frontmatter line in {path.relative_to(ROOT)}: {line}")
        key, value = line.split(":", 1)
        values[key.strip()] = value.strip().strip("'\"")
    return values


def main() -> None:
    manifest = read_json(MANIFEST)
    if not isinstance(manifest, dict):
        fail("plugin manifest must be an object")
    if manifest.get("name") != "manse-creator":
        fail("plugin manifest name must be manse-creator")
    if not isinstance(manifest.get("version"), str):
        fail("plugin manifest needs a version")
    if manifest.get("skills") != "./skills/":
        fail("plugin manifest must expose ./skills/")
    if any(token in json.dumps(manifest) for token in ("[TODO:", "Local developer")):
        fail("plugin manifest still contains scaffold metadata")

    marketplace = read_json(MARKETPLACE)
    if not isinstance(marketplace, dict) or not isinstance(marketplace.get("plugins"), list):
        fail("marketplace must contain a plugins array")
    entries = [entry for entry in marketplace["plugins"] if entry.get("name") == "manse-creator"]
    if len(entries) != 1:
        fail("marketplace must contain exactly one manse-creator entry")
    entry = entries[0]
    if entry.get("policy", {}).get("installation") != "AVAILABLE":
        fail("plugin must be available for installation")
    if entry.get("policy", {}).get("authentication") not in {"ON_INSTALL", "ON_USE"}:
        fail("plugin marketplace entry needs an authentication policy")

    skill_paths = sorted((PLUGIN / "skills").glob("*/SKILL.md"))
    if not skill_paths:
        fail("plugin has no skills")
    seen: set[str] = set()
    for skill_path in skill_paths:
        values = parse_skill_frontmatter(skill_path)
        if set(values) != {"name", "description"}:
            fail(f"frontmatter in {skill_path.relative_to(ROOT)} must contain only name and description")
        name = values["name"]
        if not NAME_RE.fullmatch(name):
            fail(f"invalid skill name {name}")
        if name != skill_path.parent.name:
            fail(f"skill name {name} does not match folder {skill_path.parent.name}")
        if not values["description"]:
            fail(f"skill {name} has an empty description")
        if name in seen:
            fail(f"duplicate skill name {name}")
        seen.add(name)
        metadata = skill_path.parent / "agents" / "openai.yaml"
        if not metadata.is_file():
            fail(f"skill {name} is missing agents/openai.yaml")

    print(f"plugin validation: ok ({len(skill_paths)} skills)")


if __name__ == "__main__":
    main()
