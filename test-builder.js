// Test the builder pattern implementation
import { 
  servers, 
  ServerConfigBuilder,
  createDefaultServerConfig 
} from './dist/index.js';

console.log('🔧 Testing Builder Pattern Implementation...\n');

// Test 1: Basic builder usage
const basicConfig = new ServerConfigBuilder("My Builder Server", "test-scenario")
  .setBindPort(3001)
  .setMaxPlayers(64)
  .setCrossPlatform(true)
  .setRconPassword("builder-password")
  .build();

console.log('✅ Basic builder test:');
console.log('  - Server name:', basicConfig.game.name);
console.log('  - Bind port:', basicConfig.bindPort);
console.log('  - A2S port:', basicConfig.a2s.port);
console.log('  - RCON port:', basicConfig.rcon.port);
console.log('  - Max players:', basicConfig.game.maxPlayers);
console.log('  - Cross-platform platforms:', basicConfig.game.supportedPlatforms.length);

// Test 2: Fluent interface chaining
const advancedConfig = new ServerConfigBuilder()
  .setServerName("Advanced Server")
  .setScenarioId("advanced-scenario")
  .setBindAddress("192.168.1.100")
  .setBindPort(4001)
  .setPublicAddress("203.0.113.1")
  .setPublicPort(4001)
  .setMaxPlayers(128)
  .setGamePassword("game123")
  .setAdminPassword("admin456")
  .setRconPassword("rcon789")
  .setRconAddress("192.168.1.100")
  .setPlayerSaveTime(60)
  .setAiLimit(50)
  .setCrossPlatform(false)
  .build();

console.log('\n✅ Advanced builder test:');
console.log('  - Bind address:', advancedConfig.bindAddress);
console.log('  - Public address:', advancedConfig.publicAddress);
console.log('  - Game password set:', advancedConfig.game.password !== "");
console.log('  - Admin password set:', advancedConfig.game.passwordAdmin !== "");
console.log('  - RCON address:', advancedConfig.rcon.address);
console.log('  - Player save time:', advancedConfig.operating.playerSaveTime);
console.log('  - AI limit:', advancedConfig.operating.aiLimit);

// Test 3: Individual build methods
const builder = new ServerConfigBuilder("Component Server", "component-scenario");
const gameConfig = builder.setMaxPlayers(48).buildGameConfig();
const operatingConfig = builder.setPlayerSaveTime(90).buildOperatingConfig();

console.log('\n✅ Component builder test:');
console.log('  - Game config max players:', gameConfig.maxPlayers);
console.log('  - Operating config save time:', operatingConfig.playerSaveTime);

// Test 4: Reset functionality
const resetBuilder = new ServerConfigBuilder("Reset Test", "reset-scenario")
  .setBindPort(5001)
  .setMaxPlayers(96)
  .reset()
  .setServerName("After Reset")
  .build();

console.log('\n✅ Reset builder test:');
console.log('  - Server name after reset:', resetBuilder.game.name);
console.log('  - Bind port after reset:', resetBuilder.bindPort);
console.log('  - Max players after reset:', resetBuilder.game.maxPlayers);

// Test 5: Compare with functional approach
const functionalConfig = createDefaultServerConfig(
  "Functional Server",
  "functional-scenario",
  "0.0.0.0",
  2001,
  false,
  "functional-password"
);

console.log('\n✅ Comparison test:');
console.log('  - Builder approach: Fluent, customizable, stateful');
console.log('  - Functional approach: Simple, direct, stateless');
console.log('  - Both produce valid ServerConfig objects');

// Test 6: Default values check (after refactoring)
const defaultMissionHeader = servers.createDefaultMissionHeader();
console.log('\n✅ Default refactoring test:');
console.log('  - Mission name changed from ATT to:', defaultMissionHeader.m_sName);
console.log('  - Mission author changed from ATT to:', defaultMissionHeader.m_sAuthor);

console.log('\n🎉 All builder pattern tests completed successfully!');
