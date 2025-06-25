#!/usr/bin/env node

// Example usage of the ServerConfigParser
import { 
  parseServerConfig, 
  validateServerConfig,
  createDefaultServerConfig,
  OfficialScenarios,
  ServerConfigParser 
} from '../dist/index.js';

console.log('🔍 Reforger-Types Parser Example\n');

// 1. Parse a valid configuration
console.log('1. Parsing a valid server configuration...');
const validConfig = createDefaultServerConfig(
  'Example Server',
  OfficialScenarios.CONFLICT_EVERON,
  '0.0.0.0',
  2001,
  true,
  'admin123'
);

const parseResult = parseServerConfig(validConfig);
if (parseResult.success) {
  console.log('✅ Valid configuration parsed successfully!');
  console.log(`   Server: ${parseResult.data.game.name}`);
  console.log(`   Port: ${parseResult.data.bindPort}`);
  console.log(`   Max Players: ${parseResult.data.game.maxPlayers}`);
  console.log(`   Cross-Platform: ${parseResult.data.game.crossPlatform}`);
} else {
  console.log('❌ Parse failed:', parseResult.errors);
}
console.log();

// 2. Parse invalid JSON
console.log('2. Handling invalid JSON...');
const invalidJsonResult = parseServerConfig('{ invalid json }');
if (!invalidJsonResult.success) {
  console.log('❌ Expected error:', invalidJsonResult.errors[0]);
}
console.log();

// 3. Validate incomplete configuration
console.log('3. Validating incomplete configuration...');
const incompleteConfig = {
  bindAddress: '192.168.1.100',
  // Missing required properties
};

const validationResult = validateServerConfig(incompleteConfig);
if (!validationResult.success) {
  console.log('❌ Validation failed (expected):', validationResult.errors[0]);
}
console.log();

// 4. Using parser with custom options
console.log('4. Using parser with custom options...');
const strictParser = new ServerConfigParser({
  strict: true,
  allowDefaults: false,
  validateRanges: true
});

const strictResult = strictParser.parseServerConfig(validConfig);
if (strictResult.success) {
  console.log('✅ Strict parsing successful');
} else {
  console.log('❌ Strict parsing failed:', strictResult.errors);
}
console.log();

// 5. Parse individual components (placeholder)
console.log('5. Individual component parsing...');
const gameConfigResult = strictParser.parseGameConfig({
  name: 'Component Test',
  maxPlayers: 32,
  scenarioId: '{TEST123}Missions/Test.conf',
  visible: true,
  crossPlatform: false
});

console.log('✅ Game config parsing result:', gameConfigResult.success ? 'Success' : 'Failed');
console.log();

console.log('🎉 Parser example completed!');
console.log('💡 The parser is ready for extension with more validation logic.');
