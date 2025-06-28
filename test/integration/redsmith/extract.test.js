#!/usr/bin/env node

/**
 * Integration test for redsmith extract command and all its subcommands.
 * 
 * Tests the extract command functionality including:
 * - extract mods from configurations with and without mods
 * - different output formats (json, yaml, csv, text)
 * - stdout vs file output
 * - format inference from file extensions
 * - error handling for invalid configurations
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { REDSMITH_DIST_PATH, TEST_FILES, CONFIG_VALIDATOR_CONFIGS } from './references.js';

console.log('🧪 Testing redsmith extract command...');

/**
 * Helper function to run redsmith extract command and capture output
 */
function runExtractCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [REDSMITH_DIST_PATH, 'extract', ...args], {
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
      resolve({ code, stdout, stderr });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Test setup helper: Returns path to a config file that contains mods
 */
function getConfigWithMods() {
  // Use the valid server config from config-validator example which has mods
  return CONFIG_VALIDATOR_CONFIGS.VALID;
}

/**
 * Test setup helper: Returns path to a config file with no mods
 */
function getConfigWithoutMods() {
  // Use the test server config which has no mods
  return TEST_FILES.SERVER_CONFIG;
}

/**
 * Test setup helper: Returns path to a malformed config file
 */
function getInvalidConfig() {
  // Use the malformed config from config-validator example
  return CONFIG_VALIDATOR_CONFIGS.MALFORMED;
}

/**
 * Helper function to safely clean up test files
 * Won't throw if file doesn't exist
 */
async function cleanupTestFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore file not found errors - file may not have been created
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Failed to cleanup test file ${filePath}: ${error.message}`);
    }
  }
}

/**
 * Helper function to generate a temporary file path
 * Uses os.tmpdir() for cross-platform compatibility
 */
function getTempFilePath(extension) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return join(tmpdir(), `redsmith-test-${timestamp}-${random}.${extension}`);
}

/**
 * Test 1: Extract mods from server config with no mods, default JSON output to stdout
 */
async function testExtractModsNoMods() {
  console.log('\n🔍 Test 1: Extract mods from config with no mods (JSON to stdout)');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithoutMods()]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have output to stdout
    if (!result.stdout.trim()) {
      throw new Error('No output to stdout');
    }
    
    // Parse the JSON output
    let mods;
    try {
      mods = JSON.parse(result.stdout.trim());
    } catch (parseError) {
      throw new Error(`Output is not valid JSON: ${result.stdout}`);
    }
    
    // Should be an empty array
    if (!Array.isArray(mods)) {
      throw new Error(`Expected array, got: ${typeof mods}`);
    }
    
    if (mods.length !== 0) {
      throw new Error(`Expected empty array, got array with ${mods.length} items`);
    }
    
    console.log('✅ Test 1 passed: Empty mods array returned as valid JSON');
    return true;
    
  } catch (error) {
    console.error(`❌ Test 1 failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Extract mods from server config with mods, default JSON output to stdout
 */
async function testExtractModsWithMods() {
  console.log('\n🔍 Test 2: Extract mods from config with mods (JSON to stdout)');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods()]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have output to stdout
    if (!result.stdout.trim()) {
      throw new Error('No output to stdout');
    }
    
    // Parse the JSON output
    let mods;
    try {
      mods = JSON.parse(result.stdout.trim());
    } catch (parseError) {
      throw new Error(`Output is not valid JSON: ${result.stdout}`);
    }
    
    // Should be an array with mods
    if (!Array.isArray(mods)) {
      throw new Error(`Expected array, got: ${typeof mods}`);
    }
    
    if (mods.length === 0) {
      throw new Error('Expected mods array to contain items, got empty array');
    }
    
    // Validate that each mod has required properties
    for (const mod of mods) {
      if (!mod.modId) {
        throw new Error(`Mod missing modId: ${JSON.stringify(mod)}`);
      }
    }
    
    console.log(`✅ Test 2 passed: Found ${mods.length} mod(s) as valid JSON`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 2 failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Extract mods with YAML format output
 */
async function testExtractModsYamlFormat() {
  console.log('\n🔍 Test 3: Extract mods with YAML format output');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), '--output', 'yaml']);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have output to stdout
    if (!result.stdout.trim()) {
      throw new Error('No output to stdout');
    }
    
    // Basic YAML validation - should contain YAML-like structure
    const output = result.stdout.trim();
    if (!output.includes('-') || !output.includes(':')) {
      throw new Error(`Output does not appear to be YAML format: ${output}`);
    }
    
    // Should contain mod-related fields
    if (!output.includes('modId')) {
      throw new Error(`YAML output missing expected modId field: ${output}`);
    }
    
    console.log('✅ Test 3 passed: YAML format output generated successfully');
    return true;
    
  } catch (error) {
    console.error(`❌ Test 3 failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Extract mods with CSV format output
 */
async function testExtractModsCsvFormat() {
  console.log('\n🔍 Test 4: Extract mods with CSV format output');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), '--output', 'csv']);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have output to stdout
    if (!result.stdout.trim()) {
      throw new Error('No output to stdout');
    }
    
    const output = result.stdout.trim();
    const lines = output.split('\n');
    
    // Should have at least 2 lines (header + at least one data row)
    if (lines.length < 2) {
      throw new Error(`Expected at least 2 lines (header + data), got ${lines.length} lines`);
    }
    
    // First line should be CSV header
    const header = lines[0];
    const expectedHeader = 'modId,name,version,required';
    if (header !== expectedHeader) {
      throw new Error(`Expected CSV header "${expectedHeader}", got "${header}"`);
    }
    
    // Subsequent lines should be CSV data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Skip empty lines
      
      // Should contain commas (CSV format)
      if (!line.includes(',')) {
        throw new Error(`CSV data row ${i} missing commas: "${line}"`);
      }
      
      // Should have mod ID (16-character hex string at start)
      const columns = line.split(',');
      if (columns.length < 1 || !columns[0]) {
        throw new Error(`CSV data row ${i} missing modId: "${line}"`);
      }
    }
    
    console.log('✅ Test 4 passed: CSV format output generated successfully');
    return true;
    
  } catch (error) {
    console.error(`❌ Test 4 failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Extract mods with text format output
 */
async function testExtractModsTextFormat() {
  console.log('\n🔍 Test 5: Extract mods with text format output');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), '--output', 'text']);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have output to stdout
    if (!result.stdout.trim()) {
      throw new Error('No output to stdout');
    }
    
    const output = result.stdout.trim();
    const lines = output.split('\n').filter(line => line.trim() !== '');
    
    // Should have at least one line (at least one mod ID)
    if (lines.length === 0) {
      throw new Error('Expected at least one mod ID line, got empty output');
    }
    
    // Each line should be a mod ID (16-character hex string)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Should be exactly 16 characters
      if (line.length !== 16) {
        throw new Error(`Expected 16-character mod ID, got "${line}" (${line.length} characters)`);
      }
      
      // Should be hexadecimal (only 0-9, A-F)
      if (!/^[0-9A-F]{16}$/i.test(line)) {
        throw new Error(`Expected hexadecimal mod ID, got "${line}"`);
      }
    }
    
    console.log(`✅ Test 5 passed: Text format output generated ${lines.length} mod ID(s) successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 5 failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Extract mods to JSON file (format inference)
 */
async function testExtractModsToJsonFile() {
  console.log('\n🔍 Test 6: Extract mods to JSON file (format inference)');
  
  const outputFile = getTempFilePath('json');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), outputFile]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have created the output file
    const fileContent = await fs.readFile(outputFile, 'utf-8');
    
    // Parse the JSON content
    let mods;
    try {
      mods = JSON.parse(fileContent.trim());
    } catch (parseError) {
      throw new Error(`File content is not valid JSON: ${fileContent}`);
    }
    
    // Should be an array with mods
    if (!Array.isArray(mods)) {
      throw new Error(`Expected array, got: ${typeof mods}`);
    }
    
    if (mods.length === 0) {
      throw new Error('Expected mods array to contain items, got empty array');
    }
    
    // Validate that each mod has required properties
    for (const mod of mods) {
      if (!mod.modId) {
        throw new Error(`Mod missing modId: ${JSON.stringify(mod)}`);
      }
    }
    
    console.log(`✅ Test 6 passed: JSON format inferred from .json extension, ${mods.length} mod(s) written to file`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 6 failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestFile(outputFile);
  }
}

/**
 * Test 7: Extract mods to YAML file (format inference)
 */
async function testExtractModsToYamlFile() {
  console.log('\n🔍 Test 7: Extract mods to YAML file (format inference)');
  
  const outputFile = getTempFilePath('yaml');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), outputFile]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have created the output file
    const fileContent = await fs.readFile(outputFile, 'utf-8');
    
    // Basic YAML validation - should contain YAML-like structure
    const content = fileContent.trim();
    if (!content.includes('-') || !content.includes(':')) {
      throw new Error(`File content does not appear to be YAML format: ${content}`);
    }
    
    // Should contain mod-related fields
    if (!content.includes('modId')) {
      throw new Error(`YAML file missing expected modId field: ${content}`);
    }
    
    // Should contain at least one mod entry (indicated by list item marker)
    const lines = content.split('\n');
    const listItems = lines.filter(line => line.trim().startsWith('-'));
    if (listItems.length === 0) {
      throw new Error(`Expected at least one YAML list item, got none in: ${content}`);
    }
    
    console.log(`✅ Test 7 passed: YAML format inferred from .yaml extension, content written to file`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 7 failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestFile(outputFile);
  }
}

/**
 * Test 8: Extract mods to CSV file (format inference)
 */
async function testExtractModsToCsvFile() {
  console.log('\n🔍 Test 8: Extract mods to CSV file (format inference)');
  
  const outputFile = getTempFilePath('csv');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), outputFile]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have created the output file
    const fileContent = await fs.readFile(outputFile, 'utf-8');
    
    const content = fileContent.trim();
    const lines = content.split('\n');
    
    // Should have at least 2 lines (header + at least one data row)
    if (lines.length < 2) {
      throw new Error(`Expected at least 2 lines (header + data), got ${lines.length} lines`);
    }
    
    // First line should be CSV header
    const header = lines[0];
    const expectedHeader = 'modId,name,version,required';
    if (header !== expectedHeader) {
      throw new Error(`Expected CSV header "${expectedHeader}", got "${header}"`);
    }
    
    // Subsequent lines should be CSV data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Skip empty lines
      
      // Should contain commas (CSV format)
      if (!line.includes(',')) {
        throw new Error(`CSV data row ${i} missing commas: "${line}"`);
      }
      
      // Should have mod ID (16-character hex string at start)
      const columns = line.split(',');
      if (columns.length < 1 || !columns[0]) {
        throw new Error(`CSV data row ${i} missing modId: "${line}"`);
      }
    }
    
    console.log(`✅ Test 8 passed: CSV format inferred from .csv extension, content written to file`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 8 failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestFile(outputFile);
  }
}

/**
 * Test 9: Extract mods to text file (format inference)
 */
async function testExtractModsToTextFile() {
  console.log('\n🔍 Test 9: Extract mods to text file (format inference)');
  
  const outputFile = getTempFilePath('txt');
  
  try {
    const result = await runExtractCommand(['mods', getConfigWithMods(), outputFile]);
    
    // Should succeed with exit code 0
    if (result.code !== 0) {
      throw new Error(`Command failed with exit code ${result.code}. STDERR: ${result.stderr}`);
    }
    
    // Should have created the output file
    const fileContent = await fs.readFile(outputFile, 'utf-8');
    
    const content = fileContent.trim();
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Should have at least one line (at least one mod ID)
    if (lines.length === 0) {
      throw new Error('Expected at least one mod ID line, got empty file');
    }
    
    // Each line should be a mod ID (16-character hex string)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Should be exactly 16 characters
      if (line.length !== 16) {
        throw new Error(`Expected 16-character mod ID, got "${line}" (${line.length} characters)`);
      }
      
      // Should be hexadecimal (only 0-9, A-F)
      if (!/^[0-9A-F]{16}$/i.test(line)) {
        throw new Error(`Expected hexadecimal mod ID, got "${line}"`);
      }
    }
    
    console.log(`✅ Test 9 passed: Text format inferred from .txt extension, ${lines.length} mod ID(s) written to file`);
    return true;
    
  } catch (error) {
    console.error(`❌ Test 9 failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestFile(outputFile);
  }
}

/**
 * Run all extract command tests
 */
async function runExtractTests() {
  console.log('🧪 Running redsmith extract command integration tests');
  console.log('='.repeat(60));
  
  const tests = [
    testExtractModsNoMods,
    testExtractModsWithMods,
    testExtractModsYamlFormat,
    testExtractModsCsvFormat,
    testExtractModsTextFormat,
    testExtractModsToJsonFile,
    testExtractModsToYamlFile,
    testExtractModsToCsvFile,
    testExtractModsToTextFile,
    // Additional tests will be added here as approved
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await test();
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Extract Command Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Some extract command tests failed');
    process.exit(1);
  } else {
    console.log('\n🎉 All extract command tests passed!');
    process.exit(0);
  }
}

// Run the tests
runExtractTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});
