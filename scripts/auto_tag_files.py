#!/usr/bin/env python3

import os
import json
from pathlib import Path

WORKSPACE = Path('/Users/macmini/clawd')

def auto_tag(relative_path):
    """Auto-tag files based on path and name patterns"""
    tags = []
    file_name = os.path.basename(relative_path)
    dir_name = os.path.dirname(relative_path)
    
    # Core files
    core_files = ['AGENTS.md', 'SOUL.md', 'USER.md', 'IDENTITY.md', 'BOOTSTRAP.md', 'SECURITY.md', 'TOOLS.md']
    if file_name in core_files and dir_name == '':
        tags.append('core')
    
    # Config files
    if file_name == 'HEARTBEAT.md':
        tags.extend(['core', 'config'])
    if file_name == 'README.md' and dir_name == '':
        tags.extend(['core', 'config'])
    
    # Memory files
    if relative_path.startswith('memory/'):
        tags.append('memory')
        
        # Long-term memory
        if file_name == 'MEMORY.md':
            pass  # Only memory tag
        # Projects
        elif 'project' in file_name.lower() or file_name == 'projects-open.md':
            tags.append('project')
        # Research
        elif any(word in file_name.lower() for word in ['research', 'report', 'analysis', 'learning', 'competitor', 'investigation']):
            tags.append('research')
        # Logs
        elif any(word in file_name.lower() for word in ['log', 'history']):
            tags.append('project')
    
    # Skills
    if '/skills/' in relative_path and file_name == 'SKILL.md':
        tags.append('skill')
    
    # Clients
    if '/samples/' in relative_path and file_name in ['CLIENT.md', 'BRIEFING.md']:
        tags.append('client')
    
    # Templates
    if 'template' in file_name.lower():
        tags.append('template')
    
    # Archive
    if any(word in relative_path.lower() for word in ['/archive/', '/briefings/']):
        tags.append('archive')
    
    # Config/docs in deep paths
    if relative_path.count('/') > 2 and not tags:
        if '/docs/' in relative_path or file_name.startswith('README'):
            tags.append('config')
    
    # Research (anywhere)
    if not tags and any(word in file_name.lower() for word in ['competitor', 'research', 'analysis', 'spike']):
        tags.append('research')
    
    # Default tagging by directory depth and patterns
    if not tags:
        # Deep skill references
        if '/skills/' in relative_path:
            tags.append('skill')
        # Client folders
        elif any(word in relative_path.lower() for word in ['/clients/', '/samples/']):
            tags.append('client')
        # Docs and setup files
        elif any(word in file_name.upper() for word in ['README', 'SETUP', 'GUIDE', 'WORKFLOW']):
            tags.append('config')
        # Strategy, plans, briefings
        elif any(word in file_name.lower() for word in ['plan', 'strategy', 'brief', 'coach', 'metodolog']):
            tags.append('project')
        # Reports and stats
        elif any(word in file_name.lower() for word in ['report', 'stats', 'metrics', 'analytics']):
            tags.append('research')
    
    return list(set(tags)) if tags else None

def scan_files():
    """Scan all .md files in workspace"""
    files = []
    skip_dirs = {'node_modules', '.git', '.next', 'dist', 'build', 'out', '.cache', '.remotion', 'coverage'}
    
    for root, dirs, filenames in os.walk(WORKSPACE):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        
        for filename in filenames:
            if filename.endswith('.md'):
                full_path = os.path.join(root, filename)
                relative_path = os.path.relpath(full_path, WORKSPACE)
                files.append(relative_path)
    
    return files

def main():
    tags_config = {
        "tags": {
            "core": {"label": "Core", "color": "red", "description": "Archivos fundamentales del sistema"},
            "memory": {"label": "Memory", "color": "purple", "description": "Memoria a largo plazo y notas diarias"},
            "client": {"label": "Client", "color": "blue", "description": "Información de clientes"},
            "skill": {"label": "Skill", "color": "green", "description": "Documentación de skills"},
            "project": {"label": "Project", "color": "orange", "description": "Proyectos en curso"},
            "research": {"label": "Research", "color": "cyan", "description": "Investigación y análisis"},
            "template": {"label": "Template", "color": "gray", "description": "Templates y ejemplos"},
            "config": {"label": "Config", "color": "yellow", "description": "Configuración y setup"},
            "archive": {"label": "Archive", "color": "slate", "description": "Archivado / referencia histórica"}
        },
        "fileTags": {}
    }
    
    files = scan_files()
    tagged = 0
    untagged = 0
    
    for relative_path in files:
        tags = auto_tag(relative_path)
        if tags:
            tags_config["fileTags"][relative_path] = tags
            tagged += 1
        else:
            untagged += 1
    
    # Save
    output_path = Path(__file__).parent.parent / 'public' / 'memory-tags.json'
    with open(output_path, 'w') as f:
        json.dump(tags_config, f, indent=2)
    
    print(f"✅ Tagged {tagged} files")
    print(f"⚠️  Untagged {untagged} files")
    print(f"📄 Saved to {output_path}")
    
    # Show examples
    print("\n📋 Examples:")
    for path, tags in list(tags_config["fileTags"].items())[:10]:
        print(f"  {path}: {', '.join(tags)}")

if __name__ == '__main__':
    main()
