#!/usr/bin/env node

/**
 * Tool for preparing all example packages for integration testing
 * 
 * Usage:
 *   node tools/prep-all-examples.js [--revert]
 * 
 * This tool batch-processes all examples that have package.json files
 * to either use local file references or revert to published versions.
 */

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const isRevert = args.includes('--revert');
const skipInstall = args.includes('--skip-install');

/**
 * Find all examples with package.json files
 */
function findExamplesWithPackageJson() {
  const examplesDir = path.join(rootDir, 'examples');
  const examples = [];
  
  try {
    const entries = readdirSync(examplesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const packageJsonPath = path.join(examplesDir, entry.name, 'package.json');
        if (existsSync(packageJsonPath)) {
          examples.push(entry.name);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error reading examples directory:', error.message);
    process.exit(1);
  }
  
  return examples;
}

/**
 * Main execution
 */
function main() {
  const examples = findExamplesWithPackageJson();
  
  if (examples.length === 0) {
    console.log('📭 No examples with package.json files found');
    return;
  }
  
  console.log(`🛠️  ${isRevert ? 'Reverting' : 'Preparing'} ${examples.length} examples for integration testing...`);
  console.log(`📦 Examples: ${examples.join(', ')}`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const example of examples) {
    try {
      console.log(`📝 Processing ${example}...`);
      const command = `node tools/prep-for-integration-testing.js ${example}${isRevert ? ' --revert' : ''}${skipInstall ? ' --skip-install' : ''}`;
      execSync(command, { 
        cwd: rootDir,
        stdio: 'pipe' // Suppress output for cleaner batch processing
      });
      console.log(`✅ ${example}: Success`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${example}: Failed`);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount}`);
  }
  
  if (successCount > 0) {
    console.log('');
    if (skipInstall) {
      console.log('📝 Manual steps needed:');
      console.log('   Run "npm install" in each example directory');
      console.log('   Run "npm run build" in examples that need building');
    } else {
      console.log('✅ All examples processed and dependencies installed');
      if (!isRevert) {
        console.log('📝 Next steps:');
        console.log('   Run integration tests...');
        console.log('   When done: node tools/prep-all-examples.js --revert');
      }
    }
  }
}

main();
