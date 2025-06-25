#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('🧪 Running Config Validator Integration Tests');
console.log('============================================');

const configValidatorPath = path.join(projectRoot, 'examples', 'config-validator');

// Helper function to run commands with proper error handling
function runCommand(command, cwd = configValidatorPath, description = '') {
  console.log(`\n📝 ${description || `Running: ${command}`}`);
  try {
    const result = execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log('✅ Success');
    return { success: true, output: result };
  } catch (error) {
    console.log('❌ Failed');
    console.error(`Error: ${error.message}`);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    return { success: false, error, output: error.stdout || error.stderr };
  }
}

// Test 1: Check if config-validator directory exists
console.log('\n🔍 Test 1: Checking config-validator directory exists');
if (!existsSync(configValidatorPath)) {
  console.error('❌ Config validator directory does not exist');
  process.exit(1);
}
console.log('✅ Config validator directory exists');

// Test 2: Install dependencies
console.log('\n🔍 Test 2: Installing dependencies');
const installResult = runCommand('npm install', configValidatorPath, 'Installing config-validator dependencies');
if (!installResult.success) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Test 3: Build the project
console.log('\n🔍 Test 3: Building config validator');
const buildResult = runCommand('npm run build', configValidatorPath, 'Building config-validator');
if (!buildResult.success) {
  console.error('❌ Failed to build config validator');
  process.exit(1);
}

// Test 4: Validate valid configuration (should succeed)
console.log('\n🔍 Test 4: Testing valid configuration');
const validConfigResult = runCommand(
  'node dist/cli.js configs/valid-server.json', 
  configValidatorPath, 
  'Validating valid-server.json (should pass)'
);
if (!validConfigResult.success) {
  console.error('❌ Valid configuration test failed - this should have passed');
  process.exit(1);
}
if (!validConfigResult.output.includes('Configuration is valid!')) {
  console.error('❌ Valid configuration test did not return expected success message');
  console.log('Output:', validConfigResult.output);
  process.exit(1);
}

// Test 5: Validate problematic configuration (should fail with exit code 1 but provide output)
console.log('\n🔍 Test 5: Testing problematic configuration');
const problematicConfigResult = runCommand(
  'node dist/cli.js configs/problematic-server.json', 
  configValidatorPath, 
  'Validating problematic-server.json (should show errors)'
);
// This should fail (exit code 1) but still provide useful output
if (problematicConfigResult.success) {
  console.error('❌ Problematic configuration test passed - this should have failed');
  process.exit(1);
}
if (!problematicConfigResult.output.includes('ERRORS') && !problematicConfigResult.output.includes('Configuration has errors')) {
  console.error('❌ Problematic configuration test did not show expected error output');
  console.log('Output:', problematicConfigResult.output);
  process.exit(1);
}
console.log('✅ Problematic configuration correctly identified errors');

// Test 6: Test help command
console.log('\n🔍 Test 6: Testing help command');
const helpResult = runCommand(
  'node dist/cli.js --help', 
  configValidatorPath, 
  'Testing help command'
);
if (!helpResult.success) {
  console.error('❌ Help command failed');
  process.exit(1);
}
if (!helpResult.output.includes('Usage:') || !helpResult.output.includes('validate-config')) {
  console.error('❌ Help command did not return expected help text');
  console.log('Output:', helpResult.output);
  process.exit(1);
}

// Test 7: Test file not found error
console.log('\n🔍 Test 7: Testing file not found error handling');
const notFoundResult = runCommand(
  'node dist/cli.js nonexistent-file.json', 
  configValidatorPath, 
  'Testing file not found error (should fail gracefully)'
);
// This should fail but with proper error message
if (notFoundResult.success) {
  console.error('❌ File not found test passed - this should have failed');
  process.exit(1);
}
if (!notFoundResult.output.includes('Configuration file not found')) {
  console.error('❌ File not found test did not show expected error message');
  console.log('Output:', notFoundResult.output);
  process.exit(1);
}
console.log('✅ File not found error handled correctly');

// Test 8: Test npm script shortcuts
console.log('\n🔍 Test 8: Testing npm script shortcuts');
const npmValidResult = runCommand(
  'npm run validate:example', 
  configValidatorPath, 
  'Testing npm run validate:example'
);
if (!npmValidResult.success) {
  console.error('❌ npm run validate:example failed');
  process.exit(1);
}

const npmProblematicResult = runCommand(
  'npm run validate:problematic', 
  configValidatorPath, 
  'Testing npm run validate:problematic'
);
// This should fail (exit code 1) but that's expected
if (npmProblematicResult.success) {
  console.error('❌ npm run validate:problematic passed - this should have failed');
  process.exit(1);
}
console.log('✅ npm scripts work correctly');

console.log('\n🎉 All Config Validator Integration Tests Passed!');
console.log('================================================');
console.log('✅ Dependencies install correctly');
console.log('✅ Project builds successfully');
console.log('✅ Valid configurations are accepted');
console.log('✅ Invalid configurations are properly rejected');
console.log('✅ Help command works');
console.log('✅ Error handling works correctly');
console.log('✅ npm scripts function properly');
console.log('');
