import { spawn } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { REDSMITH_DIST_PATH, TEST_FILES } from './references.js';

const REDSMITH_PATH = REDSMITH_DIST_PATH;
const CSV_MOD_FILE = TEST_FILES.CSV_MODS;
const CSV_MINIMAL_FILE = TEST_FILES.CSV_MINIMAL_MODS;

// Helper function to run redsmith with given options and validate output
async function runRedsmithTest(testName, args, expectedModIds, expectedModCount) {
  return new Promise((resolve, reject) => {
    const outputFile = join(process.cwd(), `test-${testName.replace(/\s+/g, '-').toLowerCase()}.json`);
    
    // Clean up any existing test file
    if (existsSync(outputFile)) {
      unlinkSync(outputFile);
    }
    
    console.log(`Testing ${testName}...`);
    
    const fullArgs = [
      REDSMITH_PATH,
      '--name', `${testName} Server`,
      '--bind-address', '127.0.0.1',
      '--public-address', '127.0.0.1',
      '--port', '2001',
      '--scenario', 'conflict-everon',
      '--output-file', outputFile,
      '--yes',
      ...args
    ];
    
    const child = spawn('node', fullArgs, { stdio: 'pipe' });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      try {
        if (code !== 0) {
          console.error(`❌ ${testName} failed with exit code ${code}`);
          console.error('STDOUT:', stdout);
          console.error('STDERR:', stderr);
          return reject(new Error(`Process exited with code ${code}`));
        }
        
        if (!existsSync(outputFile)) {
          return reject(new Error(`Output file not created: ${outputFile}`));
        }
        
        const configContent = readFileSync(outputFile, 'utf-8');
        const config = JSON.parse(configContent);
        
        // Validate mods array
        if (!config.game || !config.game.mods) {
          return reject(new Error('No mods found in configuration'));
        }
        
        const actualModCount = config.game.mods.length;
        if (actualModCount !== expectedModCount) {
          return reject(new Error(`Expected ${expectedModCount} mods, but got ${actualModCount}`));
        }
        
        // Check that expected mod IDs are present
        const actualModIds = config.game.mods.map(mod => mod.modId).sort();
        const sortedExpectedIds = expectedModIds.sort();
        
        if (JSON.stringify(actualModIds) !== JSON.stringify(sortedExpectedIds)) {
          return reject(new Error(`Mod IDs mismatch. Expected: ${sortedExpectedIds.join(', ')}, Got: ${actualModIds.join(', ')}`));
        }
        
        console.log(`✅ ${testName} passed: ${actualModCount} mods loaded correctly`);
        console.log(`   Mods: ${actualModIds.join(', ')}`);
        
        // Clean up
        unlinkSync(outputFile);
        resolve();
        
      } catch (error) {
        reject(error);
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🧪 Running CSV mod list integration tests...');
  
  try {
    // Test 1: CSV file with full headers (modId,name,version,required)
    await runRedsmithTest(
      'CSV full format',
      ['--mod-list-file', CSV_MOD_FILE],
      ['591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      3
    );
    
    // Test 2: CSV file with minimal headers (modId,name only)
    await runRedsmithTest(
      'CSV minimal format',
      ['--mod-list-file', CSV_MINIMAL_FILE],
      ['111111111111111C', '222222222222222D'],
      2
    );
    
    // Test 3: Combined CLI mods and CSV file
    await runRedsmithTest(
      'Combined CLI and CSV',
      ['--mods', '1111111111111111,2222222222222222', '--mod-list-file', CSV_MOD_FILE],
      ['1111111111111111', '2222222222222222', '591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      5
    );
    
    // Test 4: Deduplication between CLI and CSV (using overlapping mod ID)
    await runRedsmithTest(
      'CSV deduplication',
      ['--mods', '591AF5BDA9F7CE8B,3333333333333333', '--mod-list-file', CSV_MOD_FILE],
      ['591AF5BDA9F7CE8B', '3333333333333333', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      4
    );
    
    console.log('🎉 All CSV mod list integration tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
