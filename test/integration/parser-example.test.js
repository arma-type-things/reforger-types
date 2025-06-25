import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Parser Example Integration Tests');
console.log('==========================================');

const examplePath = path.join(__dirname, '../../examples/parser-example.js');
const rootPath = path.join(__dirname, '../..');

// Test 1: Check if example file exists
console.log('🔍 Test 1: Checking parser-example.js exists');
if (!fs.existsSync(examplePath)) {
  console.error('❌ Failed: parser-example.js not found');
  process.exit(1);
}
console.log('✅ Parser example file exists');

// Test 2: Run the parser example
console.log('🔍 Test 2: Running parser example');
console.log('📝 Executing parser-example.js');
try {
  const result = execSync(`cd "${rootPath}" && node examples/parser-example.js`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  // Check if output contains expected content
  if (result.includes('Reforger-Types Parser Example') && 
      result.includes('Configuration parsed successfully') && 
      result.includes('Parser class works') &&
      result.includes('Parser example completed')) {
    console.log('✅ Parser example executed successfully');
  } else {
    console.error('❌ Failed: Unexpected output from parser example');
    console.error('Output:', result);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed: Error running parser example');
  console.error('Error:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout);
  if (error.stderr) console.error('STDERR:', error.stderr);
  process.exit(1);
}

// Test 3: Verify example demonstrates key parser features
console.log('🔍 Test 3: Verifying example demonstrates parser features');
const exampleContent = fs.readFileSync(examplePath, 'utf8');

const expectedFeatures = [
  'Parser',
  'parse',
  'createDefaultServerConfig',
  '.parse(',
  'success',
  'data'
];

for (const feature of expectedFeatures) {
  if (!exampleContent.includes(feature)) {
    console.error(`❌ Failed: Example doesn't demonstrate '${feature}'`);
    process.exit(1);
  }
}
console.log('✅ Example demonstrates all key parser features');

console.log('🎉 All Parser Example Integration Tests Passed!');
console.log('===============================================');
console.log('✅ Example file exists and is accessible');
console.log('✅ Example runs without errors');
console.log('✅ Example produces expected output');
console.log('✅ Example demonstrates key parser features');
