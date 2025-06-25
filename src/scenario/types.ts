// Mission resource path types for Arma Reforger

/**
 * Represents a mission resource identifier provided by the base game or a mod when loaded
 * Example: "ECC61978EDCC2B5A"
 */
export type MissionResourceId = string;

/**
 * Represents a relative path within a mission resource
 * Example: "Missions/23_Campaign.conf"
 */
export type MissionPath = string;

/**
 * Composite type representing a mission resource reference
 * Combines a mission resource identifier with a relative path
 * Renders as a string in format: "{MissionResourceId}RelativePath"
 */
export class MissionResourceReference {
  private _resourceId: MissionResourceId;
  private _path: MissionPath;

  constructor(resourceId: MissionResourceId, path: MissionPath) {
    this._resourceId = resourceId;
    this._path = path;
  }

  get resourceId(): MissionResourceId {
    return this._resourceId;
  }

  get path(): MissionPath {
    return this._path;
  }

  /**
   * Converts the composite type to its string representation
   * Example: "{ECC61978EDCC2B5A}Missions/23_Campaign.conf"
   */
  toString(): string {
    return `{${this._resourceId}}${this._path}`;
  }

  /**
   * Creates a MissionResourceReference from a string representation
   * Parses format: "{MissionResourceId}RelativePath"
   */
  static fromString(resourceString: string): MissionResourceReference {
    const match = resourceString.match(/^\{([A-Z0-9]+)\}(.+)$/);
    if (!match) {
      throw new Error(`Invalid mission resource format: ${resourceString}. Expected format: {RESOURCE_ID}path`);
    }

    const [, resourceId, path] = match;
    return new MissionResourceReference(resourceId, path);
  }

  /**
   * Validates if a string is a valid mission resource reference format
   */
  static isValid(resourceString: string): boolean {
    return /^\{[A-Z0-9]+\}.+$/.test(resourceString);
  }

  /**
   * JSON serialization support
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Automatic conversion to string primitive for concatenation and template literals
   */
  valueOf(): string {
    return this.toString();
  }

  /**
   * Symbol.toPrimitive implementation for automatic type conversion
   */
  [Symbol.toPrimitive](hint: string): string {
    if (hint === 'string' || hint === 'default') {
      return this.toString();
    }
    return this.toString();
  }
}

/**
 * Specific type for scenario IDs used in server configuration
 * Extends MissionResourceReference with scenario-specific validation
 */
export class ScenarioId extends MissionResourceReference {
  constructor(resourceId: MissionResourceId, missionPath: MissionPath) {
    super(resourceId, missionPath);
  }

  /**
   * Creates a ScenarioId from a string representation
   */
  static fromString(scenarioString: string): ScenarioId {
    const baseRef = MissionResourceReference.fromString(scenarioString);
    return new ScenarioId(baseRef.resourceId, baseRef.path);
  }

  /**
   * Validates if the path looks like a mission/scenario path
   */
  isValidScenarioPath(): boolean {
    const lowerPath = this.path.toLowerCase();
    return lowerPath.includes('mission') || lowerPath.endsWith('.conf');
  }
}

/**
 * Official scenarios provided by Bohemia Interactive
 * These are the built-in scenarios available in Arma Reforger v1.3.0+
 * 
 * Excludes single-player scenarios (SP01_*) as they are not suitable for server hosting
 */
export const OfficialScenarios = {
  // Main Conflict scenarios
  CONFLICT_EVERON: new ScenarioId("ECC61978EDCC2B5A", "Missions/23_Campaign.conf"),
  CONFLICT_NORTHERN_EVERON: new ScenarioId("C700DB41F0C546E1", "Missions/23_Campaign_NorthCentral.conf"),
  CONFLICT_SOUTHERN_EVERON: new ScenarioId("28802845ADA64D52", "Missions/23_Campaign_SWCoast.conf"),
  CONFLICT_WESTERN_EVERON: new ScenarioId("94992A3D7CE4FF8A", "Missions/23_Campaign_Western.conf"),
  CONFLICT_MONTIGNAC: new ScenarioId("FDE33AFE2ED7875B", "Missions/23_Campaign_Montignac.conf"),
  CONFLICT_ARLAND: new ScenarioId("C41618FD18E9D714", "Missions/23_Campaign_Arland.conf"),
  
  // Combat Ops scenarios
  COMBAT_OPS_ARLAND: new ScenarioId("DAA03C6E6099D50F", "Missions/24_CombatOps.conf"),
  COMBAT_OPS_EVERON: new ScenarioId("DFAC5FABD11F2390", "Missions/26_CombatOpsEveron.conf"),
  
  // Game Master scenarios
  GAME_MASTER_EVERON: new ScenarioId("59AD59368755F41A", "Missions/21_GM_Eden.conf"),
  GAME_MASTER_ARLAND: new ScenarioId("2BBBE828037C6F4B", "Missions/22_GM_Arland.conf"),
  
  // Tutorial scenario
  TUTORIAL: new ScenarioId("002AF7323E0129AF", "Missions/Tutorial.conf"),
  
  // Capture & Hold scenarios
  CAH_BRIARS: new ScenarioId("3F2E005F43DBD2F8", "Missions/CAH_Briars_Coast.conf"),
  CAH_CASTLE: new ScenarioId("F1A1BEA67132113E", "Missions/CAH_Castle.conf"),
  CAH_CONCRETE_PLANT: new ScenarioId("589945FB9FA7B97D", "Missions/CAH_Concrete_Plant.conf"),
  CAH_FACTORY: new ScenarioId("9405201CBD22A30C", "Missions/CAH_Factory.conf"),
  CAH_FOREST: new ScenarioId("1CD06B409C6FAE56", "Missions/CAH_Forest.conf"),
  CAH_LE_MOULE: new ScenarioId("7C491B1FCC0FF0E1", "Missions/CAH_LeMoule.conf"),
  CAH_MILITARY_BASE: new ScenarioId("6EA2E454519E5869", "Missions/CAH_Military_Base.conf"),
  CAH_MORTON: new ScenarioId("2B4183DF23E88249", "Missions/CAH_Morton.conf"),
} as const;

/**
 * Type representing the keys of official scenarios
 */
export type OfficialScenarioName = keyof typeof OfficialScenarios;
