import { spawn } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { REDSMITH_DIST_PATH, TEST_FILES } from './references.js';

const REDSMITH_PATH = REDSMITH_DIST_PATH;
const JSON_MOD_FILE = TEST_FILES.JSON_MODS;
const TXT_MOD_FILE = TEST_FILES.TXT_MODS;

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
    
    const child = spawn('node', fullArgs, {
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
      try {
        if (code !== 0) {
          console.error(`❌ ${testName} failed: Process exited with code ${code}`);
          if (stderr) console.error('STDERR:', stderr);
          if (stdout) console.error('STDOUT:', stdout);
          return reject(new Error(`Process failed with code ${code}`));
        }
        
        if (!existsSync(outputFile)) {
          console.error(`❌ ${testName} failed: Output file not created`);
          return reject(new Error('Output file not created'));
        }
        
        const configContent = readFileSync(outputFile, 'utf-8');
        const config = JSON.parse(configContent);
        
        if (!config.game || !config.game.mods) {
          console.error(`❌ ${testName} failed: No mods found in config`);
          return reject(new Error('No mods in config'));
        }
        
        const actualModIds = config.game.mods.map(m => m.modId);
        
        // Check mod count
        if (config.game.mods.length !== expectedModCount) {
          console.error(`❌ ${testName} failed: Expected ${expectedModCount} mods, got ${config.game.mods.length}`);
          console.error('Expected mod IDs:', expectedModIds);
          console.error('Actual mod IDs:', actualModIds);
          return reject(new Error(`Wrong mod count`));
        }
        
        // Check that all expected mods are present
        for (const expectedId of expectedModIds) {
          if (!actualModIds.includes(expectedId)) {
            console.error(`❌ ${testName} failed: Missing expected mod ${expectedId}`);
            console.error('Expected mod IDs:', expectedModIds);
            console.error('Actual mod IDs:', actualModIds);
            return reject(new Error(`Missing mod ${expectedId}`));
          }
        }
        
        console.log(`✅ ${testName} passed: ${config.game.mods.length} mods loaded correctly`);
        console.log(`   Mods: ${actualModIds.join(', ')}`);
        
        resolve(config);
      } catch (error) {
        console.error(`❌ ${testName} failed: ${error.message}`);
        reject(error);
      } finally {
        if (existsSync(outputFile)) {
          unlinkSync(outputFile);
        }
      }
    });
  });
}

// Run all tests
async function runAllTests() {
  try {
    console.log('🧪 Running comprehensive mod list integration tests...\n');
    
    // Test 1: JSON file only
    await runRedsmithTest(
      'JSON mod list file only',
      ['--mod-list-file', JSON_MOD_FILE],
      ['591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      3
    );
    
    // Test 2: Text file only  
    await runRedsmithTest(
      'Text mod list file only',
      ['--mod-list-file', TXT_MOD_FILE],
      ['591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      3
    );
    
    // Test 3: CLI mods only
    await runRedsmithTest(
      'CLI mods only',
      ['--mods', '1111111111111111,2222222222222222'],
      ['1111111111111111', '2222222222222222'],
      2
    );
    
    // Test 4: Combined CLI and JSON file (no duplicates)
    await runRedsmithTest(
      'Combined CLI and JSON file',
      ['--mods', '1111111111111111,2222222222222222', '--mod-list-file', JSON_MOD_FILE],
      ['1111111111111111', '2222222222222222', '591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      5
    );
    
    // Test 5: Combined CLI and text file (no duplicates)  
    await runRedsmithTest(
      'Combined CLI and text file',
      ['--mods', '3333333333333333,4444444444444444', '--mod-list-file', TXT_MOD_FILE],
      ['3333333333333333', '4444444444444444', '591AF5BDA9F7CE8B', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      5
    );
    
    // Test 6: Deduplication - CLI mod duplicates one from file
    await runRedsmithTest(
      'Deduplication test',
      ['--mods', '591AF5BDA9F7CE8B,5555555555555555', '--mod-list-file', JSON_MOD_FILE],
      ['591AF5BDA9F7CE8B', '5555555555555555', '5A5A5A5A5A5A5A5A', 'DEADBEEFDEADBEEF'],
      4  // Should be 4, not 5, due to deduplication
    );
    
    console.log('\n🎉 All mod list integration tests passed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
