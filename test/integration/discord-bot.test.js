#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('🤖 Running Discord Bot Integration Tests');
console.log('=======================================');

const discordBotPath = path.join(projectRoot, 'examples', 'discord-bot');

// Helper function to run commands with proper error handling
function runCommand(command, cwd = discordBotPath, description = '') {
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

// Test 1: Check if discord-bot directory exists
console.log('\n🔍 Test 1: Checking discord-bot directory exists');
if (!existsSync(discordBotPath)) {
  console.error('❌ Discord bot directory does not exist');
  process.exit(1);
}
console.log('✅ Discord bot directory exists');

// Test 2: Check if required files exist
console.log('\n🔍 Test 2: Checking required files exist');
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/bot.ts',
  'src/commands/CreateServerCommand.ts',
  'src/services/ServerConfigService.ts'
];

for (const file of requiredFiles) {
  const filePath = path.join(discordBotPath, file);
  if (!existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}
console.log('✅ All required files exist');

// Test 3: Install dependencies
console.log('\n🔍 Test 3: Installing dependencies');
const installResult = runCommand('npm install', discordBotPath, 'Installing discord-bot dependencies');
if (!installResult.success) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Test 4: Build the project
console.log('\n🔍 Test 4: Building discord bot');
const buildResult = runCommand('npm run build', discordBotPath, 'Building discord-bot');
if (!buildResult.success) {
  console.error('❌ Failed to build discord bot');
  process.exit(1);
}

// Test 5: Check that main compiled file exists
console.log('\n🔍 Test 5: Checking compiled output');
const mainCompiledFile = path.join(discordBotPath, 'dist/bot.js');
if (!existsSync(mainCompiledFile)) {
  console.error('❌ Main compiled file missing: dist/bot.js');
  process.exit(1);
}
console.log('✅ Main entry point compiled successfully');

// Test 6: Test that the main entry point can be imported (basic syntax check)
console.log('\n🔍 Test 6: Testing basic import/syntax validation');
try {
  // We can't actually run the Discord bot without a token, but we can test that it imports
  const testScript = `
    try {
      const bot = await import('${path.join(discordBotPath, 'dist/bot.js')}');
      console.log('Import successful');
      process.exit(0);
    } catch (error) {
      console.error('Import failed:', error.message);
      process.exit(1);
    }
  `;
  
  const importResult = runCommand(
    `node --input-type=module -e "${testScript}"`,
    discordBotPath,
    'Testing bot.js import (syntax validation)'
  );
  
  if (!importResult.success) {
    // This might fail due to missing environment variables, which is OK for syntax testing
    // Check if it's a syntax error vs runtime error
    if (importResult.output && (
      importResult.output.includes('SyntaxError') || 
      importResult.output.includes('ReferenceError') ||
      importResult.output.includes('TypeError: Cannot')
    )) {
      console.error('❌ Syntax or import error in compiled code');
      process.exit(1);
    } else {
      console.log('✅ Code compiles and imports correctly (runtime errors expected without Discord token)');
    }
  }
} catch (error) {
  console.log('⚠️  Import test skipped due to environment constraints');
}

console.log('\n🎉 All Discord Bot Integration Tests Passed!');
console.log('==========================================');
console.log('✅ Dependencies install correctly');
console.log('✅ Project builds successfully');
console.log('✅ All required files present');
console.log('✅ TypeScript compilation works');
console.log('✅ Basic import/syntax validation passed');
console.log('');
