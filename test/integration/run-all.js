#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Running All Integration Tests');
console.log('===============================');

// Helper function to run test files
function runTest(testFile) {
  const testPath = path.join(__dirname, testFile);
  console.log(`\n🧪 Running ${testFile}...`);
  console.log('─'.repeat(50));
  
  try {
    execSync(`node "${testPath}"`, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`\n✅ ${testFile} completed successfully`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${testFile} failed with exit code ${error.status}`);
    return false;
  }
}

// Get all test files in the integration directory
const testFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.test.js') && file !== 'run-all.js')
  .sort(); // Run tests in alphabetical order

if (testFiles.length === 0) {
  console.log('⚠️  No integration test files found');
  process.exit(0);
}

console.log(`Found ${testFiles.length} integration test(s):`);
testFiles.forEach(file => console.log(`  • ${file}`));

let passedTests = 0;
let failedTests = 0;
const failedTestNames = [];

// Run each test file
for (const testFile of testFiles) {
  const success = runTest(testFile);
  if (success) {
    passedTests++;
  } else {
    failedTests++;
    failedTestNames.push(testFile);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Integration Test Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Total:  ${passedTests + failedTests}`);

if (failedTests > 0) {
  console.log('\n❌ Failed tests:');
  failedTestNames.forEach(name => console.log(`  • ${name}`));
  console.log('\n💡 Run individual tests for detailed error information');
  process.exit(1);
} else {
  console.log('\n🎉 All integration tests passed!');
  process.exit(0);
}
