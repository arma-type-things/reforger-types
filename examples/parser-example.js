#!/usr/bin/env node

// Parser API Example
import { 
  Parser,
  parse,
  createDefaultServerConfig,
  OfficialScenarios
} from '../dist/index.js';

console.log('🔍 Reforger-Types Parser Example\n');

// 1. Parse a valid configuration
console.log('1. Parsing a valid server configuration...');
const validConfig = createDefaultServerConfig(
  'Example Server',
  OfficialScenarios.CONFLICT_EVERON.toString(),
  '0.0.0.0',
  2001,
  true,
  'admin123'
);

const parseResult = parse(validConfig);
if (parseResult.success) {
  console.log('✅ Configuration parsed successfully!');
  console.log(`   Server: ${parseResult.data.game.name}`);
  console.log(`   Port: ${parseResult.data.bindPort}`);
  console.log(`   Max Players: ${parseResult.data.game.maxPlayers}`);
} else {
  console.log('❌ Parse failed:', parseResult.errors);
}
console.log();

// 2. Parse with validation
console.log('2. Parsing with validation enabled...');
const validationResult = parse(validConfig, { 
  validate: true,
  ignore_warnings: ['EMPTY_ADMIN_PASSWORD'] 
});

if (validationResult.success) {
  console.log('✅ Configuration is valid!');
  console.log(`   Warnings: ${validationResult.warnings?.length || 0}`);
  console.log(`   Errors: ${validationResult.validationErrors?.length || 0}`);
}
console.log();

// 3. Using Parser class
console.log('3. Using Parser class directly...');
const parser = new Parser();
const parserResult = parser.parse(validConfig, {
  validate: true,
  ignore_warnings: ['WEAK_RCON_PASSWORD', 'EMPTY_ADMIN_PASSWORD']
});

if (parserResult.success) {
  console.log('✅ Parser class works!');
  console.log(`   Server Name: ${parserResult.data?.game.name}`);
  console.log(`   Scenario: ${parserResult.data?.game.scenarioId}`);
}
console.log();

// 4. Handle invalid JSON
console.log('4. Handling invalid JSON...');
const invalidJsonResult = parse('{ invalid json }');
console.log(`❌ Expected error: ${invalidJsonResult.errors?.[0] || 'JSON parsing failed'}`);
console.log();

// 5. Parse from JSON string
console.log('5. Parsing from JSON string...');
const jsonString = JSON.stringify(validConfig);
const jsonResult = parse(jsonString, { validate: true });

if (jsonResult.success) {
  console.log('✅ JSON parsing successful!');
  console.log(`   Parsed server: ${jsonResult.data?.game.name}`);
}
console.log();

console.log('🎉 Parser example completed!');
