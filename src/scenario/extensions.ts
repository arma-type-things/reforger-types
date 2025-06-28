import { ScenarioId, OfficialScenarios, type OfficialScenarioName } from './types.js';

/**
 * Scenario metadata for display and mapping purposes
 */
export interface ScenarioMetadata {
  /** Friendly code used in CLI and user interfaces */
  code: string;
  /** Human-readable display name */
  displayName: string;
  /** Official scenario instance */
  scenario: ScenarioId;
  /** Official scenario key */
  key: OfficialScenarioName;
}

/**
 * Extended ScenarioId class with metadata and helper methods
 */
export class ScenarioIdExtended extends ScenarioId {
  private static _scenarioMap: Map<string, ScenarioMetadata> | null = null;

  /**
   * Get the complete scenario metadata map
   */
  static getScenarioMap(): Map<string, ScenarioMetadata> {
    if (!this._scenarioMap) {
      this._scenarioMap = new Map([
        ['conflict-everon', {
          code: 'conflict-everon',
          displayName: 'Conflict Everon',
          scenario: OfficialScenarios.CONFLICT_EVERON,
          key: 'CONFLICT_EVERON'
        }],
        ['conflict-northern-everon', {
          code: 'conflict-northern-everon',
          displayName: 'Conflict Northern Everon',
          scenario: OfficialScenarios.CONFLICT_NORTHERN_EVERON,
          key: 'CONFLICT_NORTHERN_EVERON'
        }],
        ['conflict-southern-everon', {
          code: 'conflict-southern-everon',
          displayName: 'Conflict Southern Everon',
          scenario: OfficialScenarios.CONFLICT_SOUTHERN_EVERON,
          key: 'CONFLICT_SOUTHERN_EVERON'
        }],
        ['conflict-western-everon', {
          code: 'conflict-western-everon',
          displayName: 'Conflict Western Everon',
          scenario: OfficialScenarios.CONFLICT_WESTERN_EVERON,
          key: 'CONFLICT_WESTERN_EVERON'
        }],
        ['conflict-montignac', {
          code: 'conflict-montignac',
          displayName: 'Conflict Montignac',
          scenario: OfficialScenarios.CONFLICT_MONTIGNAC,
          key: 'CONFLICT_MONTIGNAC'
        }],
        ['conflict-arland', {
          code: 'conflict-arland',
          displayName: 'Conflict Arland',
          scenario: OfficialScenarios.CONFLICT_ARLAND,
          key: 'CONFLICT_ARLAND'
        }],
        ['combat-ops-arland', {
          code: 'combat-ops-arland',
          displayName: 'Combat Ops Arland',
          scenario: OfficialScenarios.COMBAT_OPS_ARLAND,
          key: 'COMBAT_OPS_ARLAND'
        }],
        ['combat-ops-everon', {
          code: 'combat-ops-everon',
          displayName: 'Combat Ops Everon',
          scenario: OfficialScenarios.COMBAT_OPS_EVERON,
          key: 'COMBAT_OPS_EVERON'
        }],
        ['game-master-everon', {
          code: 'game-master-everon',
          displayName: 'Game Master Everon',
          scenario: OfficialScenarios.GAME_MASTER_EVERON,
          key: 'GAME_MASTER_EVERON'
        }],
        ['game-master-arland', {
          code: 'game-master-arland',
          displayName: 'Game Master Arland',
          scenario: OfficialScenarios.GAME_MASTER_ARLAND,
          key: 'GAME_MASTER_ARLAND'
        }]
      ]);
    }
    return this._scenarioMap;
  }

  /**
   * Get scenario by friendly code
   */
  static fromCode(code: string): ScenarioId | undefined {
    const metadata = this.getScenarioMap().get(code.toLowerCase());
    return metadata?.scenario;
  }

  /**
   * Get all available scenario metadata
   */
  static getAllScenarios(): ScenarioMetadata[] {
    return Array.from(this.getScenarioMap().values());
  }

  /**
   * Get scenario metadata by code
   */
  static getMetadata(code: string): ScenarioMetadata | undefined {
    return this.getScenarioMap().get(code.toLowerCase());
  }

  /**
   * Map scenario name to ScenarioId (for backwards compatibility)
   */
  static mapScenarioName(scenarioName?: string): ScenarioId | undefined {
    if (!scenarioName) return undefined;
    return this.fromCode(scenarioName);
  }
}
