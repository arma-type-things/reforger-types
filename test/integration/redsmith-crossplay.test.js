#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const testDir = path.join(__dirname, '..', '..', 'examples', 'redsmith');
const testCrossplayFile = path.join(testDir, 'test-crossplay-enabled.json');
const testNoCrossplayFile = path.join(testDir, 'test-crossplay-disabled.json');

function cleanup() {
  // Clean up test files
  const files = [testCrossplayFile, testNoCrossplayFile];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

function runCommand(command, expectSuccess = true) {
  try {
    const output = execSync(command, { 
      cwd: testDir, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output, exitCode: 0 };
  } catch (error) {
    if (expectSuccess) {
      throw new Error(`Command failed: ${command}\nError: ${error.message}\nOutput: ${error.stdout || error.stderr}`);
    }
    return { 
      success: false, 
      output: error.stdout || error.stderr || error.message,
      exitCode: error.status || 1
    };
  }
}

async function main() {
  console.log('🧪 Testing Redsmith crossplay functionality...');
  
  try {
    // Ensure we start clean
    cleanup();

    console.log('✅ Test 1: Default crossplay enabled');
    const enabledResult = runCommand(
      'node dist/index.js --name "Crossplay Enabled Server" --bind-address "0.0.0.0" --public-address "192.168.1.100" --port 2001 --scenario "conflict-everon" --output "./test-crossplay-enabled.json" --yes',
      true
    );
    
    // Verify file was created
    if (!fs.existsSync(testCrossplayFile)) {
      throw new Error('Crossplay enabled config file was not created');
    }
    
    // Verify crossplay is enabled in config
    const enabledConfig = JSON.parse(fs.readFileSync(testCrossplayFile, 'utf8'));
    if (enabledConfig.game.crossPlatform !== true) {
      throw new Error('Crossplay should be enabled by default');
    }
    
    // Verify output shows crossplay enabled
    if (!enabledResult.output.includes('Cross-Platform: Enabled')) {
      throw new Error('Output should show Cross-Platform: Enabled');
    }

    console.log('✅ Test 2: Explicitly disabled crossplay');
    const disabledResult = runCommand(
      'node dist/index.js --name "Crossplay Disabled Server" --bind-address "0.0.0.0" --public-address "192.168.1.100" --port 2001 --scenario "conflict-everon" --output "./test-crossplay-disabled.json" --no-cross-platform --yes',
      true
    );
    
    // Verify file was created
    if (!fs.existsSync(testNoCrossplayFile)) {
      throw new Error('Crossplay disabled config file was not created');
    }
    
    // Verify crossplay is disabled in config
    const disabledConfig = JSON.parse(fs.readFileSync(testNoCrossplayFile, 'utf8'));
    if (disabledConfig.game.crossPlatform !== false) {
      throw new Error('Crossplay should be disabled when --no-cross-platform is used');
    }
    
    // Verify output shows crossplay disabled
    if (!disabledResult.output.includes('Cross-Platform: Disabled')) {
      throw new Error('Output should show Cross-Platform: Disabled');
    }

    console.log('🎉 All crossplay tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
