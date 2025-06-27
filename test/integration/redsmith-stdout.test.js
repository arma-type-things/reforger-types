#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const testDir = path.join(__dirname, '..', '..', 'examples', 'redsmith');

function runCommand(command, expectSuccess = true) {
  try {
    const result = execSync(command, { 
      cwd: testDir, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    if (!expectSuccess) {
      throw new Error(`Expected command to fail but it succeeded: ${command}`);
    }
    return { success: true, output: result };
  } catch (error) {
    if (expectSuccess) {
      throw new Error(`Command failed: ${command}\nError: ${error.message}\nOutput: ${error.stdout}\nStderr: ${error.stderr}`);
    }
    return { success: false, output: error.stdout || '', stderr: error.stderr || '' };
  }
}

function extractJsonFromOutput(output) {
  // Extract the JSON from the output - look for the first { that starts a complete JSON object
  const lines = output.split('\n');
  let jsonStartIndex = -1;
  let braceCount = 0;
  let inJson = false;
  
  // Find where JSON starts and ends
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!inJson && line === '{') {
      jsonStartIndex = i;
      inJson = true;
      braceCount = 1;
    } else if (inJson) {
      // Count braces to find the end of JSON
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      if (braceCount === 0) {
        // Found the end of JSON
        const jsonLines = lines.slice(jsonStartIndex, i + 1);
        const jsonString = jsonLines.join('\n').trim();
        return JSON.parse(jsonString);
      }
    }
  }
  
  throw new Error('Could not find complete JSON object in output');
}

function main() {
  console.log('🧪 Testing Redsmith stdout (--) feature...');
  
  try {
    // Test 1: Basic stdout functionality
    console.log('✅ Test 1: Basic stdout functionality with -- flag');
    const command1 = [
      'node', 'dist/index.js',
      '--name', '"Test Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--yes',
      '--'
    ].join(' ');

    const result1 = runCommand(command1);
    const config1 = extractJsonFromOutput(result1.output);
    
    // Verify essential properties
    if (config1.game.name !== 'Test Server') {
      throw new Error(`Expected server name 'Test Server', got '${config1.game.name}'`);
    }
    if (config1.bindAddress !== '0.0.0.0') {
      throw new Error(`Expected bind address '0.0.0.0', got '${config1.bindAddress}'`);
    }
    if (config1.publicAddress !== '192.168.1.100') {
      throw new Error(`Expected public address '192.168.1.100', got '${config1.publicAddress}'`);
    }
    if (config1.bindPort !== 2001) {
      throw new Error(`Expected bind port 2001, got ${config1.bindPort}`);
    }
    if (config1.game.scenarioId !== '{ECC61978EDCC2B5A}Missions/23_Campaign.conf') {
      throw new Error(`Expected conflict-everon scenario, got '${config1.game.scenarioId}'`);
    }
    if (config1.game.crossPlatform !== true) {
      throw new Error(`Expected cross-platform enabled, got ${config1.game.crossPlatform}`);
    }

    // Test 2: Stdout with mods and mission header
    console.log('✅ Test 2: Stdout with mods and mission header');
    const command2 = [
      'node', 'dist/index.js',
      '--name', '"Modded Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--mods', '123456789ABCDEF0,FEDCBA9876543210',
      '--mission-name', '"My Mission"',
      '--mission-author', '"Test Author"',
      '--yes',
      '--'
    ].join(' ');

    const result2 = runCommand(command2);
    const config2 = extractJsonFromOutput(result2.output);
    
    // Verify mods
    if (!config2.game.mods || config2.game.mods.length !== 2) {
      throw new Error(`Expected 2 mods, got ${config2.game.mods?.length || 0}`);
    }
    if (config2.game.mods[0].modId !== '123456789ABCDEF0') {
      throw new Error(`Expected first mod ID '123456789ABCDEF0', got '${config2.game.mods[0].modId}'`);
    }
    if (config2.game.mods[1].modId !== 'FEDCBA9876543210') {
      throw new Error(`Expected second mod ID 'FEDCBA9876543210', got '${config2.game.mods[1].modId}'`);
    }
    
    // Verify mission header
    if (config2.game.gameProperties.missionHeader.m_sName !== 'My Mission') {
      throw new Error(`Expected mission name 'My Mission', got '${config2.game.gameProperties.missionHeader.m_sName}'`);
    }
    if (config2.game.gameProperties.missionHeader.m_sAuthor !== 'Test Author') {
      throw new Error(`Expected mission author 'Test Author', got '${config2.game.gameProperties.missionHeader.m_sAuthor}'`);
    }

    // Test 3: Cross-platform disabled
    console.log('✅ Test 3: Cross-platform disabled with stdout');
    const command3 = [
      'node', 'dist/index.js',
      '--name', '"PC Only Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--no-cross-platform',
      '--yes',
      '--'
    ].join(' ');

    const result3 = runCommand(command3);
    const config3 = extractJsonFromOutput(result3.output);
    
    // Verify cross-platform is disabled
    if (config3.game.crossPlatform !== false) {
      throw new Error(`Expected cross-platform disabled, got ${config3.game.crossPlatform}`);
    }
    if (!config3.game.supportedPlatforms || config3.game.supportedPlatforms.length !== 1 || config3.game.supportedPlatforms[0] !== 'PLATFORM_PC') {
      throw new Error(`Expected only PLATFORM_PC, got ${JSON.stringify(config3.game.supportedPlatforms)}`);
    }

    // Test 4: No file created when using -- flag
    console.log('✅ Test 4: No file created when using -- flag');
    const testFile = path.join(testDir, 'test-stdout.json');
    
    // Ensure the file doesn't exist before the test
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }

    const command4 = [
      'node', 'dist/index.js',
      '--name', '"Test Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--output', testFile,  // This should be ignored when -- is used
      '--yes',
      '--'
    ].join(' ');

    runCommand(command4);

    // Verify the file was NOT created
    if (fs.existsSync(testFile)) {
      throw new Error('File was created when it should not have been');
    }

    // Test 5: Normal file creation still works without -- flag
    console.log('✅ Test 5: Normal file creation without -- flag');
    const testNormalFile = path.join(testDir, 'test-normal.json');
    
    // Ensure the file doesn't exist before the test
    if (fs.existsSync(testNormalFile)) {
      fs.unlinkSync(testNormalFile);
    }

    const command5 = [
      'node', 'dist/index.js',
      '--name', '"Test Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--output', testNormalFile,
      '--yes'
    ].join(' ');

    runCommand(command5);

    // Verify the file was created
    if (!fs.existsSync(testNormalFile)) {
      throw new Error('File was not created when it should have been');
    }
    
    // Verify it contains valid JSON
    const configContent = fs.readFileSync(testNormalFile, 'utf8');
    const normalConfig = JSON.parse(configContent);
    if (normalConfig.game.name !== 'Test Server') {
      throw new Error(`Expected server name 'Test Server' in file, got '${normalConfig.game.name}'`);
    }

    // Clean up
    fs.unlinkSync(testNormalFile);

    // Test 6: Summary shows "Output: stdout" when using -- flag
    console.log('✅ Test 6: Summary shows correct output destination');
    const command6 = [
      'node', 'dist/index.js',
      '--name', '"Test Server"',
      '--scenario', 'conflict-everon',
      '--bind-address', '0.0.0.0',
      '--public-address', '192.168.1.100',
      '--port', '2001',
      '--yes',
      '--'
    ].join(' ');

    const result6 = runCommand(command6);

    // Check that the summary shows stdout as output
    if (!result6.output.includes('Output: stdout')) {
      throw new Error('Summary does not show "Output: stdout"');
    }
    if (result6.output.includes('Output Path:')) {
      throw new Error('Summary should not show "Output Path:" when using stdout');
    }

    console.log('🎉 All stdout (--) feature tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();
