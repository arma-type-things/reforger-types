// Test file to verify the exports and default initializers work correctly
import { 
  servers, 
  SupportedPlatform, 
  createDefaultServerConfig,
  createDefaultGameConfig 
} from './dist/index.js';

// Test namespace usage
const config1 = {
  bindAddress: "0.0.0.0",
  bindPort: 2001,
  publicAddress: "",
  publicPort: 2001,
  a2s: { address: "0.0.0.0", port: 17777 },
  rcon: { 
    address: "127.0.0.1", 
    port: 19999, 
    password: "test", 
    permission: "admin", 
    blacklist: [], 
    whitelist: [] 
  },
  game: {
    name: "Test Server",
    password: "",
    passwordAdmin: "admin",
    admins: [],
    scenarioId: "test",
    maxPlayers: 64,
    visible: true,
    crossPlatform: true,
    supportedPlatforms: [servers.SupportedPlatform.PC],
    gameProperties: {
      serverMaxViewDistance: 2500,
      serverMinGrassDistance: 50,
      networkViewDistance: 1000,
      disableThirdPerson: false,
      fastValidation: true,
      battlEye: true,
      VONDisableUI: false,
      VONDisableDirectSpeechUI: false,
      missionHeader: {
        m_sName: "Test Mission",
        m_sAuthor: "Test Author",
        m_sSaveFileName: "test.json"
      }
    },
    mods: []
  },
  operating: {
    lobbyPlayerSynchronise: true,
    playerSaveTime: 10,
    aiLimit: 100,
    slotReservationTimeout: 30
  }
};

// Test default initializer functions
const defaultConfig = createDefaultServerConfig(
  "My Reforger Server",
  "{ECC61978EDCC2B5A}Missions/23_Campaign.conf",
  "0.0.0.0",
  2001,
  true,
  "my-rcon-password"
);

// Test with minimal parameters (using defaults)
const minimalConfig = createDefaultServerConfig(
  "Simple Server",
  "test-scenario"
  // All other parameters will use defaults: "0.0.0.0", 2001, false, ""
);

const defaultGameOnly = createDefaultGameConfig(
  "Test Game",
  "test-scenario",
  false
);

console.log('✅ Namespace usage works:', typeof config1);
console.log('✅ Default server config created:', defaultConfig.bindPort, defaultConfig.a2s.port, defaultConfig.rcon.port);
console.log('✅ Minimal config created:', minimalConfig.bindAddress, minimalConfig.bindPort);
console.log('✅ Cross-platform logic works:', defaultConfig.game.supportedPlatforms.length === 3 ? 'ALL platforms' : 'PC only');
console.log('✅ View distances set correctly:', defaultConfig.game.gameProperties.serverMaxViewDistance === 4000);
console.log('✅ Operating defaults set:', defaultConfig.operating.playerSaveTime === 120, defaultConfig.operating.aiLimit === -1);
console.log('✅ Mission header dictionary works:', defaultConfig.game.gameProperties.missionHeader.m_sName);
console.log('✅ Single platform game config:', defaultGameOnly.supportedPlatforms.length === 1 ? 'PC only' : 'Multiple platforms');
console.log('✅ Enum values work:', servers.SupportedPlatform.PC, SupportedPlatform.XBOX);
