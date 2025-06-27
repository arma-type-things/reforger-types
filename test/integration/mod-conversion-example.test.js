// Integration test for mod-conversion-example.js
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Mod Conversion Example Integration Tests');
console.log('=================================================');

const examplePath = path.resolve(__dirname, '../../examples/mod-conversion-example.js');
const rootPath = path.resolve(__dirname, '../..');

// Test 1: Check if example file exists
console.log('🔍 Test 1: Checking mod-conversion-example.js exists');
if (!existsSync(examplePath)) {
  console.error('❌ Failed: mod-conversion-example.js not found');
  process.exit(1);
}
console.log('✅ Mod conversion example file exists');

// Test 2: Run the example and validate output
console.log('🔍 Test 2: Running mod conversion example');
console.log('📝 Executing mod-conversion-example.js');

try {
  const output = execSync(`node ${examplePath}`, { 
    encoding: 'utf8',
    cwd: rootPath,
    timeout: 10000
  });

  // Basic output validation
  if (!output.includes('Mod URL Conversion Example')) {
    console.error('❌ Failed: Expected header not found in output');
    process.exit(1);
  }

  if (!output.includes('Creating Extended Mods from URLs')) {
    console.error('❌ Failed: Expected section header not found');
    process.exit(1);
  }

  if (!output.includes('Creating Base Mod Objects from URLs')) {
    console.error('❌ Failed: Expected section header not found');
    process.exit(1);
  }

  if (!output.includes('Single URL Conversion')) {
    console.error('❌ Failed: Expected section header not found');
    process.exit(1);
  }

  if (!output.includes('Converting Extended Mods back to Base Mods')) {
    console.error('❌ Failed: Expected section header not found');
    process.exit(1);
  }

  if (!output.includes('Server Configuration Preparation')) {
    console.error('❌ Failed: Expected section header not found');
    process.exit(1);
  }

  if (!output.includes('✅')) {
    console.error('❌ Failed: No success indicators found in output');
    process.exit(1);
  }

  // Should successfully process the valid URLs
  if (!output.includes('656AC925A777AE40')) {
    console.error('❌ Failed: Expected mod ID not found');
    process.exit(1);
  }

  if (!output.includes('789DEF123ABC456B')) {
    console.error('❌ Failed: Expected mod ID not found');
    process.exit(1);
  }

  if (!output.includes('ABCD1234EFAB5678')) {
    console.error('❌ Failed: Expected mod ID not found');
    process.exit(1);
  }

  // Should filter out invalid URLs
  if (!output.includes('Successfully created 3 extended mods from 5 URLs')) {
    console.error('❌ Failed: Expected filtering message not found');
    process.exit(1);
  }

  if (!output.includes('Successfully created 3 base mods')) {
    console.error('❌ Failed: Expected base mods message not found');
    process.exit(1);
  }

  console.log('✅ Output contains expected content');
  
} catch (error) {
  console.error('❌ Failed: Error executing example:', error.message);
  process.exit(1);
}

// Test 3: Validate URL conversion details
console.log('🔍 Test 3: Validating URL conversion details');

try {
  const output = execSync(`node ${examplePath}`, { 
    encoding: 'utf8',
    cwd: rootPath,
    timeout: 10000
  });

  // Should show the single URL conversion worked
  if (!output.includes('Converted URL to mod')) {
    console.error('❌ Failed: Single URL conversion not shown');
    process.exit(1);
  }

  if (!output.includes('MyCustomMod')) {
    console.error('❌ Failed: Expected mod name not found');
    process.exit(1);
  }

  // Should show the extended to base conversion
  if (!output.includes('Has .url property: true')) {
    console.error('❌ Failed: Extended mod property check not found');
    process.exit(1);
  }

  if (!output.includes('Has .url property: false')) {
    console.error('❌ Failed: Base mod property check not found');
    process.exit(1);
  }

  // Should show final JSON configuration
  if (!output.includes('"modId"')) {
    console.error('❌ Failed: JSON modId not found');
    process.exit(1);
  }

  if (!output.includes('"version"')) {
    console.error('❌ Failed: JSON version not found');
    process.exit(1);
  }

  if (!output.includes('"required"')) {
    console.error('❌ Failed: JSON required not found');
    process.exit(1);
  }

  console.log('✅ URL conversion details validated');

} catch (error) {
  console.error('❌ Failed: Error validating conversion details:', error.message);
  process.exit(1);
}

console.log('');
console.log('🎉 All mod conversion example tests passed!');
console.log('✅ Example executes without errors');
console.log('✅ Output contains expected sections and content');
console.log('✅ URL conversion functionality works correctly');
