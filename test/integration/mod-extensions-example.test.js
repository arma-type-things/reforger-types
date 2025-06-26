import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Mod Extensions Example Integration Tests');
console.log('==================================================');

const examplePath = path.join(__dirname, '../../examples/mod-extensions-example.js');
const rootPath = path.join(__dirname, '../..');

// Test 1: Check if example file exists
console.log('🔍 Test 1: Checking mod-extensions-example.js exists');
if (!fs.existsSync(examplePath)) {
  console.error('❌ Failed: mod-extensions-example.js not found');
  process.exit(1);
}
console.log('✅ Mod extensions example file exists');

// Test 2: Run the mod extensions example
console.log('🔍 Test 2: Running mod extensions example');
console.log('📝 Executing mod-extensions-example.js');
try {
  const result = execSync(`cd "${rootPath}" && node examples/mod-extensions-example.js`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  // Check if output contains expected content
  if (result.includes('Mod Extensions Example') && 
      result.includes('Workshop URL') && 
      result.includes('Extended Mods') &&
      result.includes('Example Complete')) {
    console.log('✅ Mod extensions example executed successfully');
  } else {
    console.error('❌ Failed: Unexpected output from mod extensions example');
    console.error('Output:', result);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed: Error running mod extensions example');
  console.error('Error:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout);
  if (error.stderr) console.error('STDERR:', error.stderr);
  process.exit(1);
}

// Test 3: Verify example demonstrates key mod extension features
console.log('🔍 Test 3: Verifying example demonstrates mod extension features');
const exampleContent = fs.readFileSync(examplePath, 'utf8');

const expectedFeatures = [
  'createExtendedMod',
  'getModWorkshopUrl',
  'modIdFromUrl',
  'isValidModId',
  'WORKSHOP_BASE_URL'
];

for (const feature of expectedFeatures) {
  if (!exampleContent.includes(feature)) {
    console.error(`❌ Failed: Example doesn't demonstrate '${feature}'`);
    process.exit(1);
  }
}
console.log('✅ Example demonstrates all key mod extension features');

// Test 4: Verify example produces valid workshop URLs
console.log('🔍 Test 4: Verifying example produces valid workshop URLs');
const output = execSync(`cd "${rootPath}" && node examples/mod-extensions-example.js`, { 
  encoding: 'utf8',
  stdio: 'pipe'
});

if (output.includes('https://reforger.armaplatform.com/workshop/') && 
    output.includes('-')) {
  console.log('✅ Example produces valid workshop URLs');
} else {
  console.error('❌ Failed: Example doesn\'t produce valid workshop URLs');
  console.error('Output:', output);
  process.exit(1);
}

console.log('🎉 All Mod Extensions Example Integration Tests Passed!');
console.log('=======================================================');
console.log('✅ Example file exists and is accessible');
console.log('✅ Example runs without errors');
console.log('✅ Example produces expected output');
console.log('✅ Example demonstrates all key mod extension features');
console.log('✅ Example produces valid workshop URLs');
