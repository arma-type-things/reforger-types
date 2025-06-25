// Default values and helper functions for mission resource references

import { MissionResourceReference, ScenarioId, MissionResourceId, MissionPath } from './types.js';

/**
 * Creates a default scenario ID for server configuration
 * 
 * Uses the main Everon Conflict scenario which is the most commonly used scenario
 * for Arma Reforger servers. This scenario provides a good balance of gameplay
 * and performance for most server configurations.
 * 
 * @returns ScenarioId object for the default Everon Conflict scenario
 * 
 * @example
 * ```typescript
 * import { createDefaultScenarioId } from 'reforger-types';
 * 
 * const defaultScenario = createDefaultScenarioId();
 * console.log(defaultScenario.toString()); // "{ECC61978EDCC2B5A}Missions/23_Campaign.conf"
 * ```
 */
export function createDefaultScenarioId(): ScenarioId {
  return new ScenarioId("ECC61978EDCC2B5A", "Missions/23_Campaign.conf");
}

/**
 * Creates a scenario ID from individual components
 * 
 * Constructs a ScenarioId object from a mission resource identifier and relative path.
 * Use this when you need to create a custom scenario reference or when working with
 * mod scenarios that aren't included in the OfficialScenarios constants.
 * 
 * @param resourceId - The mission resource identifier (typically 16-character hex string)
 * @param missionPath - The relative path to the mission configuration file
 * @returns ScenarioId object for the specified scenario
 * 
 * @example
 * ```typescript
 * import { createScenarioId } from 'reforger-types';
 * 
 * const customScenario = createScenarioId("ABCD1234EFGH5678", "MyMod/CustomMission.conf");
 * console.log(customScenario.toString()); // "{ABCD1234EFGH5678}MyMod/CustomMission.conf"
 * ```
 */
export function createScenarioId(resourceId: MissionResourceId, missionPath: MissionPath): ScenarioId {
  return new ScenarioId(resourceId, missionPath);
}

/**
 * Parses a scenario ID from string format with validation
 * 
 * Converts a scenario string in the format "{ResourceId}Path" into a ScenarioId object
 * with validation. This function is useful when reading scenario configurations from
 * JSON files or user input that needs to be validated.
 * 
 * @param scenarioString - Scenario string in format "{ResourceId}Path"
 * @returns ScenarioId object parsed from the string
 * @throws {Error} If the scenario string format is invalid
 * 
 * @example
 * ```typescript
 * import { parseScenarioId } from 'reforger-types';
 * 
 * try {
 *   const scenario = parseScenarioId("{ECC61978EDCC2B5A}Missions/23_Campaign.conf");
 *   console.log(scenario.resourceId); // "ECC61978EDCC2B5A"
 *   console.log(scenario.path); // "Missions/23_Campaign.conf"
 * } catch (error) {
 *   console.error('Invalid scenario format:', error.message);
 * }
 * ```
 */
export function parseScenarioId(scenarioString: string): ScenarioId {
  try {
    const scenario = ScenarioId.fromString(scenarioString);
    if (!scenario.isValidScenarioPath()) {
      console.warn(`Scenario path may not be valid: ${scenario.path}`);
    }
    return scenario;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse scenario ID: ${message}`);
  }
}

/**
 * Validates and normalizes a scenario input to its string representation
 * 
 * Accepts either a scenario string or ScenarioId object and returns the normalized
 * string representation. If a string is provided, it will be validated and parsed
 * first. This function is useful for ensuring consistent scenario format across
 * different input types.
 * 
 * @param input - Either a scenario string in "{ResourceId}Path" format or a ScenarioId object
 * @returns Normalized scenario string in the correct format
 * @throws {Error} If the input string format is invalid (when input is a string)
 * 
 * @example
 * ```typescript
 * import { normalizeScenarioId, createScenarioId } from 'reforger-types';
 * 
 * // From string
 * const normalized1 = normalizeScenarioId("{ECC61978EDCC2B5A}Missions/23_Campaign.conf");
 * 
 * // From ScenarioId object  
 * const scenario = createScenarioId("ECC61978EDCC2B5A", "Missions/23_Campaign.conf");
 * const normalized2 = normalizeScenarioId(scenario);
 * 
 * console.log(normalized1 === normalized2); // true
 * ```
 */
export function normalizeScenarioId(input: string | ScenarioId): string {
  if (typeof input === 'string') {
    const scenario = parseScenarioId(input);
    return scenario.toString();
  }
  return input.toString();
}
