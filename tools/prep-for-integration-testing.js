#!/usr/bin/env node

/**
 * Tool for preparing example packages for integration testing
 * 
 * Usage:
 *   node tools/prep-for-integration-testing.js <example-name> [--revert]
 * 
 * This tool temporarily updates the package.json of an example to use
 * "file:../.." for reforger-types dependency during integration testing,
 * and can revert back to the published npm version when done.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const exampleName = args[0];
const isRevert = args.includes('--revert');
const skipInstall = args.includes('--skip-install');

if (!exampleName) {
  console.error('❌ Error: Please specify an example name');
  console.error('Usage: node tools/prep-for-integration-testing.js <example-name> [--revert] [--skip-install]');
  console.error('');
  console.error('Examples:');
  console.error('  node tools/prep-for-integration-testing.js config-validator');
  console.error('  node tools/prep-for-integration-testing.js discord-bot --revert');
  console.error('  node tools/prep-for-integration-testing.js redsmith --skip-install');
  process.exit(1);
}

// Find the example directory
const exampleDir = path.join(rootDir, 'examples', exampleName);
const packageJsonPath = path.join(exampleDir, 'package.json');

if (!existsSync(exampleDir)) {
  console.error(`❌ Error: Example directory not found: ${exampleDir}`);
  process.exit(1);
}

if (!existsSync(packageJsonPath)) {
  console.error(`❌ Error: package.json not found in: ${exampleDir}`);
  process.exit(1);
}

/**
 * Get the currently published version of reforger-types from npm
 */
function getPublishedVersion() {
  try {
    console.log('🔍 Checking published version of reforger-types...');
    const result = execSync('npm view reforger-types version', { 
      encoding: 'utf8',
      cwd: rootDir 
    });
    const version = result.trim();
    console.log(`📦 Published version: ${version}`);
    return version;
  } catch (error) {
    console.error('❌ Error getting published version:', error.message);
    // Fallback to current package.json version if npm view fails
    console.log('📄 Falling back to current package.json version...');
    const mainPackageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    return mainPackageJson.version;
  }
}

/**
 * Update package.json with new dependency version
 */
function updatePackageJson(newVersion) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.dependencies || !packageJson.dependencies['reforger-types']) {
      console.error(`❌ Error: reforger-types not found in dependencies of ${exampleName}`);
      process.exit(1);
    }
    
    const oldVersion = packageJson.dependencies['reforger-types'];
    packageJson.dependencies['reforger-types'] = newVersion;
    
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Updated ${exampleName}/package.json:`);
    console.log(`   ${oldVersion} → ${newVersion}`);
    
    return oldVersion;
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
    process.exit(1);
  }
}

/**
 * Install npm dependencies in the example directory
 */
function installDependencies() {
  if (skipInstall) {
    console.log('⏭️  Skipping npm install (--skip-install flag provided)');
    return;
  }
  
  try {
    console.log(`📦 Installing dependencies in ${exampleName}...`);
    execSync('npm install', { 
      cwd: exampleDir,
      stdio: 'pipe' // Capture output to avoid noise
    });
    console.log(`✅ Dependencies installed successfully`);
  } catch (error) {
    console.error(`❌ Error installing dependencies: ${error.message}`);
    console.error('💡 You can run "npm install" manually in the example directory');
  }
}

/**
 * Build the example if it has a build script
 */
function buildExample() {
  if (skipInstall) {
    return; // If skipping install, also skip build
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log(`🔨 Building ${exampleName}...`);
      execSync('npm run build', { 
        cwd: exampleDir,
        stdio: 'pipe'
      });
      console.log(`✅ Build completed successfully`);
    }
  } catch (error) {
    console.error(`❌ Error building example: ${error.message}`);
    console.error('💡 You can run "npm run build" manually in the example directory');
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`🛠️  Preparing ${exampleName} for integration testing...`);
  
  if (isRevert) {
    // Revert to published version
    const publishedVersion = getPublishedVersion();
    updatePackageJson(`^${publishedVersion}`);
    console.log(`🔄 Reverted ${exampleName} to use published version ^${publishedVersion}`);
    
    // Install the published version
    installDependencies();
    buildExample();
    
    console.log('');
    console.log('✅ Example reverted and ready for published version testing');
  } else {
    // Update to use local file reference
    const oldVersion = updatePackageJson('file:../..');
    console.log(`🔧 Updated ${exampleName} to use local development version`);
    
    // Install from local file reference
    installDependencies();
    buildExample();
    
    console.log('');
    console.log('✅ Example prepared and ready for integration testing');
    console.log(`💡 To revert: node tools/prep-for-integration-testing.js ${exampleName} --revert`);
  }
  
  if (skipInstall) {
    console.log('');
    console.log('📝 Manual steps needed:');
    console.log(`   cd examples/${exampleName}`);
    console.log('   npm install');
    if (isRevert) {
      console.log('   (to install the published version)');
    } else {
      console.log('   (to install from local file reference)');
      console.log('   npm run build (if the example needs building)');
    }
  }
}

main();
