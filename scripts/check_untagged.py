#!/usr/bin/env python3

import json
from pathlib import Path

# Load current tags
tags_file = Path(__file__).parent.parent / 'public' / 'memory-tags.json'
with open(tags_file) as f:
    data = json.load(f)
    
tagged = set(data['fileTags'].keys())

# Load all files
workspace = Path('/Users/macmini/clawd')
all_files = set()
skip_dirs = {'node_modules', '.git', '.next', 'dist', 'build', 'out', '.cache', '.remotion', 'coverage'}

for md_file in workspace.rglob('*.md'):
    # Skip excluded directories
    if any(skip in md_file.parts for skip in skip_dirs):
        continue
    rel_path = md_file.relative_to(workspace)
    all_files.add(str(rel_path))

untagged = all_files - tagged

print(f"📊 Total files: {len(all_files)}")
print(f"✅ Tagged: {len(tagged)}")
print(f"⚠️  Untagged: {len(untagged)}\n")

print("📋 Sample untagged files (first 30):")
for i, path in enumerate(sorted(untagged)[:30], 1):
    print(f"{i:2}. {path}")
