#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { REDSMITH_DIST_PATH, TEST_FILES } from './references.js';

const OUTPUT_FILE = join(process.cwd(), 'test-mod-list-combined.json');
const MOD_LIST_FILE = TEST_FILES.JSON_MODS;

// Clean up any existing test file
if (existsSync(OUTPUT_FILE)) {
  unlinkSync(OUTPUT_FILE);
}

console.log('Testing redsmith --mod-list-file with --mods (no duplicates)...');

// Test combining --mod-list-file with --mods (no duplicates)
const child = spawn('node', [
  REDSMITH_DIST_PATH,
  '--name', 'Combined Mods Test Server',
  '--bind-address', '127.0.0.1',
  '--public-address', '127.0.0.1',
  '--port', '2001',
  '--scenario', 'conflict-everon',
  '--mission-name', 'Combined Test Mission',
  '--mission-author', 'Test Author',
  '--save-file', 'combinedTestSave',
  '--output-file', OUTPUT_FILE,
  '--mods', 'ABCDEFABCDEFABCD,1234567812345678',
  '--mod-list-file', MOD_LIST_FILE,
  '--yes'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

child.on('close', (code) => {
  console.log(`Process exited with code: ${code}`);
  
  if (stderr) {
    console.error('STDERR:', stderr);
  }
  
  if (code !== 0) {
    console.error('❌ Test failed: redsmith process exited with non-zero code');
    console.error('STDOUT:', stdout);
    process.exit(1);
  }
  
  // Check if output file was created
  if (!existsSync(OUTPUT_FILE)) {
    console.error('❌ Test failed: Output file was not created');
    process.exit(1);
  }
  
  try {
    // Read and parse the generated configuration
    const configContent = readFileSync(OUTPUT_FILE, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Verify basic structure
    if (!config.game || !config.game.mods) {
      console.error('❌ Test failed: No mods found in generated config');
      console.log('Config:', JSON.stringify(config, null, 2));
      process.exit(1);
    }
    
    // Expected: 2 CLI mods + 3 file mods = 5 total
    const expectedTotalMods = 5;
    const expectedModIds = [
      'ABCDEFABCDEFABCD', // CLI mod 1
      '1234567812345678', // CLI mod 2
      '591AF5BDA9F7CE8B', // File mod 1
      '5A5A5A5A5A5A5A5A', // File mod 2
      'DEADBEEFDEADBEEF'  // File mod 3
    ];
    
    // Check that we have the expected number of mods
    if (config.game.mods.length !== expectedTotalMods) {
      console.error(`❌ Test failed: Expected ${expectedTotalMods} mods, found ${config.game.mods.length}`);
      console.log('Found mods:', config.game.mods);
      process.exit(1);
    }
    
    // Check that all expected mods are present
    for (const expectedModId of expectedModIds) {
      const found = config.game.mods.find(mod => mod.modId === expectedModId);
      if (!found) {
        console.error(`❌ Test failed: Expected mod ${expectedModId} not found`);
        console.log('Found mods:', config.game.mods);
        process.exit(1);
      }
    }
    
    // Verify CLI mods came first (should only have modId)
    const cliMods = config.game.mods.slice(0, 2);
    for (const cliMod of cliMods) {
      if (Object.keys(cliMod).length !== 1 || !cliMod.modId) {
        console.error('❌ Test failed: CLI mods should only have modId property');
        console.log('CLI mod with unexpected structure:', cliMod);
        process.exit(1);
      }
    }
    
    // Verify file mod properties were preserved
    const enhancedMovementMod = config.game.mods.find(mod => mod.modId === '591AF5BDA9F7CE8B');
    if (!enhancedMovementMod.name || enhancedMovementMod.name !== 'Enhanced Movement') {
      console.error('❌ Test failed: JSON file mod properties not preserved');
      console.log('Enhanced Movement mod:', enhancedMovementMod);
      process.exit(1);
    }
    
    console.log('✅ Test passed: Combined mods (CLI + file) loaded correctly');
    console.log(`   Loaded ${config.game.mods.length} total mods (2 CLI + 3 file)`);
    console.log(`   Mods: ${config.game.mods.map(m => m.modId).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Test failed: Error reading or parsing config file:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    if (existsSync(OUTPUT_FILE)) {
      unlinkSync(OUTPUT_FILE);
    }
  }
});
