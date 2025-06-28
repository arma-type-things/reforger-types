import { spawn } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { REDSMITH_DIST_PATH } from './references.js';

const REDSMITH_PATH = REDSMITH_DIST_PATH;
const OUTPUT_FILE = join(process.cwd(), 'test-mod-config.json');

// Clean up any existing test file
if (existsSync(OUTPUT_FILE)) {
  unlinkSync(OUTPUT_FILE);
}

console.log('Testing redsmith --mods functionality...');

// Test the --mods CLI option with valid mod IDs
const child = spawn('node', [
  REDSMITH_PATH,
  '--name', 'Mod Test Server',
  '--bind-address', '127.0.0.1',
  '--public-address', '127.0.0.1',
  '--port', '2001',
  '--scenario', 'conflict-everon',
  '--mission-name', 'Test Mission',
  '--mission-author', 'Test Author',
  '--save-file', 'testSave',
  '--output', OUTPUT_FILE,
  '--mods', '59F0B6EA44FA0442,A123B456C789DEF0'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send 'y' to confirm and save the configuration
child.stdin.write('y\n');
child.stdin.end();

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
    console.log('STDERR:', stderr);
  }
  
  if (code !== 0) {
    console.error('❌ Test failed: Process exited with non-zero code');
    process.exit(1);
  }

  // Check if the config file was created
  if (!existsSync(OUTPUT_FILE)) {
    console.error('❌ Test failed: Configuration file was not created');
    process.exit(1);
  }

  try {
    // Read and parse the generated configuration
    const configContent = readFileSync(OUTPUT_FILE, 'utf-8');
    const config = JSON.parse(configContent);

    // Validate that mods were included
    if (!config.game || !config.game.mods) {
      console.error('❌ Test failed: No mods found in configuration');
      process.exit(1);
    }

    const mods = config.game.mods;
    if (!Array.isArray(mods) || mods.length !== 2) {
      console.error('❌ Test failed: Expected 2 mods, got', mods.length);
      process.exit(1);
    }

    // Check the specific mod IDs
    const expectedModIds = ['59F0B6EA44FA0442', 'A123B456C789DEF0'];
    const actualModIds = mods.map(mod => mod.modId);
    
    for (const expectedId of expectedModIds) {
      if (!actualModIds.includes(expectedId)) {
        console.error(`❌ Test failed: Expected mod ID ${expectedId} not found`);
        process.exit(1);
      }
    }

    // Validate basic structure of mod objects
    for (const mod of mods) {
      if (!mod.modId || typeof mod.modId !== 'string') {
        console.error('❌ Test failed: Invalid mod structure:', mod);
        process.exit(1);
      }
    }

    console.log('✅ Test passed: --mods functionality works correctly');
    console.log(`   Found ${mods.length} mods in configuration:`);
    mods.forEach(mod => {
      console.log(`   - ${mod.modId}`);
    });

  } catch (error) {
    console.error('❌ Test failed: Could not parse configuration file:', error.message);
    process.exit(1);
  } finally {
    // Clean up test file
    if (existsSync(OUTPUT_FILE)) {
      unlinkSync(OUTPUT_FILE);
    }
  }
});

child.on('error', (error) => {
  console.error('❌ Test failed: Process error:', error.message);
  process.exit(1);
});
