#!/usr/bin/env node

/**
 * Integration test for redsmith validation features and the new validate sub-command.
 * 
 * This test validates that redsmith has:
 * 1. Proper input validation for interactive wizard prompts
 * 2. A working validate sub-command that integrates config-validator functionality
 * 3. Both commands working correctly in the modular structure
 * 
 * Manual testing steps for wizard validation:
 * 1. Run: npm run build (in examples/redsmith)
 * 2. Run: node dist/index.js
 * 3. Try entering empty strings for prompts - should show validation errors
 * 4. Try entering invalid file paths (without .json) - should show validation errors
 * 5. Try entering invalid IP addresses - should show validation errors
 * 
 * Automated testing for validate sub-command:
 * - Tests redsmith validate with valid and invalid configs
 * - Verifies proper exit codes and output formatting
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { REDSMITH_DIST_PATH, REDSMITH_SRC_PATH, CONFIG_VALIDATOR_CONFIGS } from './references.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing redsmith validation features...');

async function testValidation() {
  const redsmithPath = REDSMITH_DIST_PATH;
  
  console.log('\n🔍 Checking if redsmith is built...');
  if (!existsSync(redsmithPath)) {
    console.log('❌ Redsmith not found at:', redsmithPath);
    console.log('   Please run: cd examples/redsmith && npm run build');
    return false;
  }
  
  console.log('✅ Redsmith found at:', redsmithPath);
  
  // Check the source code for validation methods
  const sourcePath = REDSMITH_SRC_PATH;
  const requiredFiles = [
    'index.ts',
    'wizard.ts', 
    'wizard-steps.ts',
    'validator.ts'
  ];
  
  console.log('\n🔍 Checking modular structure...');
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(sourcePath, file);
    if (existsSync(filePath)) {
      console.log(`✅ ${file} - found`);
    } else {
      console.log(`❌ ${file} - not found`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    console.log('\n❌ Missing required modular files');
    return false;
  }
  
  // Test validate sub-command with valid config
  console.log('\n🔍 Testing validate sub-command with valid config...');
  const validConfigPath = CONFIG_VALIDATOR_CONFIGS.VALID;
  
  try {
    const output = execSync(`node "${redsmithPath}" validate "${validConfigPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output.includes('Configuration is valid!')) {
      console.log('✅ Valid config correctly identified');
    } else {
      console.log('❌ Valid config validation failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Valid config test failed:', error.message);
    return false;
  }
  
  // Test validate sub-command with problematic config
  console.log('\n🔍 Testing validate sub-command with problematic config...');
  const problematicConfigPath = CONFIG_VALIDATOR_CONFIGS.PROBLEMATIC;
  
  try {
    execSync(`node "${redsmithPath}" validate "${problematicConfigPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('❌ Problematic config should have failed with non-zero exit code');
    return false;
  } catch (error) {
    // This should fail with non-zero exit code
    if (error.stdout && error.stdout.includes('Configuration has errors')) {
      console.log('✅ Problematic config correctly identified with errors');
    } else {
      console.log('❌ Problematic config validation failed unexpectedly:', error.message);
      return false;
    }
  }
  
  // Test help commands
  console.log('\n🔍 Testing help commands...');
  try {
    const helpOutput = execSync(`node "${redsmithPath}" --help`, { encoding: 'utf8' });
    if (helpOutput.includes('validate') && helpOutput.includes('Interactive forge')) {
      console.log('✅ Main help shows both wizard and validate commands');
    } else {
      console.log('❌ Main help missing expected content');
      return false;
    }
    
    const validateHelpOutput = execSync(`node "${redsmithPath}" validate --help`, { encoding: 'utf8' });
    if (validateHelpOutput.includes('config-file') && validateHelpOutput.includes('debug')) {
      console.log('✅ Validate help shows expected options');
    } else {
      console.log('❌ Validate help missing expected content');
      return false;
    }
  } catch (error) {
    console.log('❌ Help command tests failed:', error.message);
    return false;
  }
  
  console.log('\n✅ All validation and sub-command features are working correctly');
  console.log('\n📝 Manual testing instructions for wizard validation:');
  console.log('   1. Run: cd examples/redsmith && npm run build');
  console.log('   2. Run: node dist/index.js (for wizard)');
  console.log('   3. Run: node dist/index.js validate <config-file> (for validation)');
  console.log('   4. Try entering empty strings - should show validation errors');
  console.log('   5. Try entering invalid file paths - should show validation errors');
  console.log('   6. Try entering invalid IP addresses - should show validation errors');
  
  return true;
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testValidation().then(result => {
    process.exit(result ? 0 : 1);
  });
}

export { testValidation };
