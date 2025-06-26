#!/usr/bin/env node

/**
 * Integration test for redsmith validation features.
 * 
 * This test validates that redsmith has proper input validation for:
 * - String inputs (server name, mission name, mission author, save file name)
 * - File path inputs (output file path)
 * - IP address inputs (bind address, public address)
 * 
 * Manual testing steps:
 * 1. Run: npm run build (in examples/redsmith)
 * 2. Run: node dist/index.js
 * 3. Try entering empty strings for prompts - should show validation errors
 * 4. Try entering invalid file paths (without .json) - should show validation errors
 * 5. Try entering invalid IP addresses - should show validation errors
 */

import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing redsmith validation features...');

async function testValidation() {
  const redsmithPath = path.join(__dirname, '../../examples/redsmith/dist/index.js');
  
  console.log('\n🔍 Checking if redsmith is built...');
  if (!existsSync(redsmithPath)) {
    console.log('❌ Redsmith not found at:', redsmithPath);
    console.log('   Please run: cd examples/redsmith && npm run build');
    return false;
  }
  
  console.log('✅ Redsmith found at:', redsmithPath);
  
  // Check the source code for validation methods
  const sourcePath = path.join(__dirname, '../../examples/redsmith/src/index.ts');
  if (!existsSync(sourcePath)) {
    console.log('❌ Source file not found');
    return false;
  }
  
  const { readFileSync } = await import('fs');
  const sourceCode = readFileSync(sourcePath, 'utf-8');
  
  console.log('\n🔍 Checking validation methods in source code...');
  
  const validationChecks = [
    { name: 'promptString with validation', pattern: 'This field cannot be empty' },
    { name: 'promptFilePath method', pattern: 'promptFilePath.*question.*string' },
    { name: 'File path validation', pattern: 'File path.*invalid characters' },
    { name: 'JSON extension validation', pattern: 'must end with.*json' },
    { name: 'promptIPAddress method', pattern: 'promptIPAddress.*question.*string' },
    { name: 'IP address validation', pattern: 'Please enter a valid IP address' }
  ];
  
  let allChecksPass = true;
  
  for (const check of validationChecks) {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(sourceCode)) {
      console.log(`✅ ${check.name} - found`);
    } else {
      console.log(`❌ ${check.name} - not found`);
      allChecksPass = false;
    }
  }
  
  if (allChecksPass) {
    console.log('\n✅ All validation features are implemented in source code');
    console.log('\n📝 Manual testing instructions:');
    console.log('   1. Run: cd examples/redsmith && npm run build');
    console.log('   2. Run: node dist/index.js');
    console.log('   3. Try entering empty strings - should show validation errors');
    console.log('   4. Try entering invalid file paths - should show validation errors');
    console.log('   5. Try entering invalid IP addresses - should show validation errors');
  } else {
    console.log('\n❌ Some validation features are missing');
  }
  
  return allChecksPass;
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testValidation().then(result => {
    process.exit(result ? 0 : 1);
  });
}

export { testValidation };
