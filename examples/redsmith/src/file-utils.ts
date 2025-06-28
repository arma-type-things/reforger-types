// File parsing and formatting utilities for mod lists

import * as yaml from 'js-yaml';
import { type Mod, isValidModId } from 'reforger-types';
import { FileContentType } from './types.js';

/**
 * Parse JSON/YAML content for mod list
 * Tries JSON first, falls back to YAML on parse failure
 * Returns empty list if neither format works or no valid mods found
 */
export function parseJsonYamlModList(content: string): Mod[] {
  let parsed: any;
  
  // Try JSON first
  try {
    parsed = JSON.parse(content);
  } catch {
    // JSON failed, try YAML
    try {
      parsed = yaml.load(content);
    } catch {
      return [];
    }
  }
  
  const mods: Mod[] = [];
  
  // Handle array of objects
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (typeof item === 'object' && item !== null && typeof (item as any).modId === 'string') {
        const mod: Mod = { modId: (item as any).modId };
        
        // Only add optional properties if they exist and are valid
        if (typeof (item as any).name === 'string') mod.name = (item as any).name;
        if (typeof (item as any).version === 'string') mod.version = (item as any).version;
        if (typeof (item as any).required === 'boolean') mod.required = (item as any).required;
        
        mods.push(mod);
      }
    }
  }
  // Handle single object
  else if (typeof parsed === 'object' && parsed !== null && typeof (parsed as any).modId === 'string') {
    const mod: Mod = { modId: (parsed as any).modId };
    
    if (typeof (parsed as any).name === 'string') mod.name = (parsed as any).name;
    if (typeof (parsed as any).version === 'string') mod.version = (parsed as any).version;
    if (typeof (parsed as any).required === 'boolean') mod.required = (parsed as any).required;
    
    mods.push(mod);
  }
  
  return mods;
}

/**
 * Parse plain text content for mod list
 * Returns empty list if no valid mod IDs found
 */
export function parseTextModList(content: string): Mod[] {
  try {
    const lines = content.split(/\r?\n/)
      .map(line => line.replace(/\r$/, '').trim())
      .filter(line => line.length > 0);
    
    const mods: Mod[] = [];
    
    for (const line of lines) {
      if (isValidModId(line)) {
        mods.push({ modId: line.toUpperCase() });
      }
    }
    
    return mods;
  } catch {
    return [];
  }
}

/**
 * Parse CSV content for mod list
 * Expects header row: modId,name,version,required
 * Returns empty list if no valid mod IDs found
 */
export function parseCsvModList(content: string): Mod[] {
  try {
    const lines = content.split(/\r?\n/)
      .map(line => line.replace(/\r$/, '').trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      // Need at least header + one data row
      return [];
    }
    
    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    // Verify we have at least modId column
    const modIdIndex = headers.indexOf('modid');
    if (modIdIndex === -1) {
      return [];
    }
    
    // Find optional column indices
    const nameIndex = headers.indexOf('name');
    const versionIndex = headers.indexOf('version');
    const requiredIndex = headers.indexOf('required');
    
    const mods: Mod[] = [];
    
    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length > modIdIndex && values[modIdIndex]) {
        const modIdValue = values[modIdIndex].replace(/['"]/g, ''); // Remove quotes
        
        if (isValidModId(modIdValue)) {
          const mod: Mod = { modId: modIdValue.toUpperCase() };
          
          // Add optional fields if they exist and have values
          if (nameIndex >= 0 && values[nameIndex]) {
            mod.name = values[nameIndex].replace(/['"]/g, '');
          }
          if (versionIndex >= 0 && values[versionIndex]) {
            mod.version = values[versionIndex].replace(/['"]/g, '');
          }
          if (requiredIndex >= 0 && values[requiredIndex]) {
            const reqValue = values[requiredIndex].replace(/['"]/g, '').toLowerCase();
            mod.required = reqValue === 'true' || reqValue === '1';
          }
          
          mods.push(mod);
        }
      }
    }
    
    return mods;
  } catch {
    return [];
  }
}

/**
 * Parse mod list content based on file type
 * Returns empty list if content cannot be parsed
 */
export function parseModListByType(content: string, fileType: FileContentType): Mod[] {
  switch (fileType) {
    case FileContentType.JSON:
    case FileContentType.YAML:
      return parseJsonYamlModList(content);
    case FileContentType.CSV:
      return parseCsvModList(content);
    case FileContentType.TEXT:
    default:
      return parseTextModList(content);
  }
}

/**
 * Format mod list as JSON string
 */
export function formatModsAsJson(mods: Mod[]): string {
  return JSON.stringify(mods, null, 2);
}

/**
 * Format mod list as YAML string
 */
export function formatModsAsYaml(mods: Mod[]): string {
  return yaml.dump(mods, {
    indent: 2,
    lineWidth: -1, // Disable line wrapping
    noRefs: true,  // Disable anchors and aliases
    quotingType: '"', // Use double quotes consistently
    forceQuotes: false // Only quote when necessary
  });
}

/**
 * Escape CSV value by wrapping in quotes if needed
 */
function escapeCsvValue(value: string): string {
  // Wrap in quotes if value contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape quotes by doubling them
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/**
 * Format mod list as CSV string
 * Outputs header row: modId,name,version,required
 */
export function formatModsAsCsv(mods: Mod[]): string {
  const lines: string[] = [];
  
  // Add header row
  lines.push('modId,name,version,required');
  
  // Add data rows
  for (const mod of mods) {
    const modId = escapeCsvValue(mod.modId);
    const name = escapeCsvValue(mod.name || '');
    const version = escapeCsvValue(mod.version || '');
    const required = mod.required !== undefined ? mod.required.toString() : '';
    
    lines.push(`${modId},${name},${version},${required}`);
  }
  
  return lines.join('\n');
}

/**
 * Format mod list as plain text
 * Outputs mod IDs only, one per line
 */
export function formatModsAsText(mods: Mod[]): string {
  return mods.map(mod => mod.modId).join('\n');
}

/**
 * Format mod list content based on file type
 * Returns formatted string in the specified format
 */
export function formatModsByType(mods: Mod[], fileType: FileContentType): string {
  switch (fileType) {
    case FileContentType.JSON:
      return formatModsAsJson(mods);
    case FileContentType.YAML:
      return formatModsAsYaml(mods);
    case FileContentType.CSV:
      return formatModsAsCsv(mods);
    case FileContentType.TEXT:
    default:
      return formatModsAsText(mods);
  }
}
