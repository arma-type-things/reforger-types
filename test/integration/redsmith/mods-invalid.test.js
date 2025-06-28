import { spawn } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { REDSMITH_DIST_PATH } from './references.js';

const REDSMITH_PATH = REDSMITH_DIST_PATH;
const OUTPUT_FILE = join(process.cwd(), 'test-invalid-mod-config.json');

// Clean up any existing test file
if (existsSync(OUTPUT_FILE)) {
  unlinkSync(OUTPUT_FILE);
}

console.log('Testing redsmith --mods with invalid mod IDs...');

// Test the --mods CLI option with mixed valid and invalid mod IDs
const child = spawn('node', [
  REDSMITH_PATH,
  '--name', 'Invalid Mod Test Server',
  '--bind-address', '127.0.0.1',
  '--public-address', '127.0.0.1',
  '--port', '2001',
  '--scenario', 'conflict-everon',
  '--mission-name', 'Test Mission',
  '--mission-author', 'Test Author',
  '--save-file', 'testSave',
  '--output-file', OUTPUT_FILE,
  '--mods', '59F0B6EA44FA0442,INVALID123,A123B456C789DEF0,TOOLONG1234567890,SHORT'
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
  
  if (code !== 0) {
    console.error('❌ Test failed: Process exited with non-zero code');
    console.error('STDERR:', stderr);
    process.exit(1);
  }

  // Check that warnings were displayed for invalid mod IDs
  if (!stderr.includes('Warning: Invalid mod IDs ignored:')) {
    console.error('❌ Test failed: Expected warning for invalid mod IDs not found in stderr');
    console.error('STDERR:', stderr);
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

    // Validate that only valid mods were included
    if (!config.game || !config.game.mods) {
      console.error('❌ Test failed: No mods found in configuration');
      process.exit(1);
    }

    const mods = config.game.mods;
    if (!Array.isArray(mods) || mods.length !== 2) {
      console.error('❌ Test failed: Expected 2 valid mods, got', mods.length);
      process.exit(1);
    }

    // Check that only the valid mod IDs are present
    const expectedModIds = ['59F0B6EA44FA0442', 'A123B456C789DEF0'];
    const actualModIds = mods.map(mod => mod.modId);
    
    for (const expectedId of expectedModIds) {
      if (!actualModIds.includes(expectedId)) {
        console.error(`❌ Test failed: Expected mod ID ${expectedId} not found`);
        process.exit(1);
      }
    }

    // Check that invalid mod IDs were NOT included
    const invalidIds = ['INVALID123', 'TOOLONG1234567890', 'SHORT'];
    for (const invalidId of invalidIds) {
      if (actualModIds.includes(invalidId)) {
        console.error(`❌ Test failed: Invalid mod ID ${invalidId} was included in configuration`);
        process.exit(1);
      }
    }

    console.log('✅ Test passed: Invalid mod IDs were properly filtered out');
    console.log(`   Found ${mods.length} valid mods in configuration:`);
    mods.forEach(mod => {
      console.log(`   - ${mod.modId}`);
    });
    console.log('   Invalid mod IDs were correctly ignored with warnings');

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
