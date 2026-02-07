#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/macmini/clawd';

// Reglas de auto-tagging
function autoTag(relativePath) {
  const tags = [];
  const fileName = path.basename(relativePath);
  const dirName = path.dirname(relativePath);
  
  // Core files (archivos raíz importantes)
  const coreFiles = ['AGENTS.md', 'SOUL.md', 'USER.md', 'IDENTITY.md', 'BOOTSTRAP.md', 'SECURITY.md', 'TOOLS.md'];
  if (coreFiles.includes(fileName) && dirName === '.') {
    tags.push('core');
  }
  
  // Config files
  if (fileName === 'HEARTBEAT.md' || fileName === 'README.md' && dirName === '.') {
    tags.push('core', 'config');
  }
  
  // Memory files
  if (relativePath.startsWith('memory/')) {
    tags.push('memory');
    
    // Daily notes
    if (fileName.match(/^\d{4}-\d{2}-\d{2}\.md$/)) {
      // Solo memory
    }
    // Long-term memory
    else if (fileName === 'MEMORY.md') {
      // Ya tiene memory
    }
    // Projects
    else if (fileName.includes('project') || fileName === 'projects-open.md') {
      tags.push('project');
    }
    // Research
    else if (fileName.includes('research') || fileName.includes('report') || fileName.includes('analysis') || fileName.includes('learnings')) {
      tags.push('research');
    }
    // Logs
    else if (fileName.includes('log') || fileName.includes('history')) {
      tags.push('project');
    }
  }
  
  // Skills
  if (relativePath.includes('/skills/') && fileName === 'SKILL.md') {
    tags.push('skill');
  }
  
  // Clients
  if (relativePath.includes('/samples/') && (fileName === 'CLIENT.md' || fileName === 'BRIEFING.md')) {
    tags.push('client');
  }
  
  // Templates
  if (fileName.includes('TEMPLATE') || fileName.includes('template')) {
    tags.push('template');
  }
  
  // Archive (briefings, old docs)
  if (relativePath.includes('/archive/') || relativePath.includes('/briefings/')) {
    tags.push('archive');
  }
  
  // Documentation files in deep paths
  if (relativePath.split('/').length > 3 && !tags.length) {
    if (relativePath.includes('/docs/') || fileName.startsWith('README')) {
      tags.push('config');
    }
  }
  
  // Research files (anywhere)
  if (!tags.length && (fileName.includes('competitor') || fileName.includes('research') || fileName.includes('analysis'))) {
    tags.push('research');
  }
  
  return tags.length > 0 ? tags : null;
}

// Leer archivos del API
async function getAllFiles() {
  const response = await fetch('http://localhost:3333/api/memory/list');
  const files = await response.json();
  return files.filter(f => !f.isDirectory);
}

// Main
(async () => {
  const files = await getAllFiles();
  
  const tagsConfig = {
    tags: {
      core: {
        label: "Core",
        color: "red",
        description: "Archivos fundamentales del sistema"
      },
      memory: {
        label: "Memory",
        color: "purple",
        description: "Memoria a largo plazo y notas diarias"
      },
      client: {
        label: "Client",
        color: "blue",
        description: "Información de clientes"
      },
      skill: {
        label: "Skill",
        color: "green",
        description: "Documentación de skills"
      },
      project: {
        label: "Project",
        color: "orange",
        description: "Proyectos en curso"
      },
      research: {
        label: "Research",
        color: "cyan",
        description: "Investigación y análisis"
      },
      template: {
        label: "Template",
        color: "gray",
        description: "Templates y ejemplos"
      },
      config: {
        label: "Config",
        color: "yellow",
        description: "Configuración y setup"
      },
      archive: {
        label: "Archive",
        color: "slate",
        description: "Archivado / referencia histórica"
      }
    },
    fileTags: {}
  };
  
  let tagged = 0;
  let untagged = 0;
  
  files.forEach(file => {
    const tags = autoTag(file.relativePath);
    if (tags) {
      tagsConfig.fileTags[file.relativePath] = tags;
      tagged++;
    } else {
      untagged++;
    }
  });
  
  // Write output
  const outputPath = path.join(__dirname, '../public/memory-tags.json');
  fs.writeFileSync(outputPath, JSON.stringify(tagsConfig, null, 2));
  
  console.log(`✅ Tagged ${tagged} files`);
  console.log(`⚠️  Untagged ${untagged} files`);
  console.log(`📄 Saved to ${outputPath}`);
})();
