// Default values and helper functions for mission resource references

import { MissionResourceReference, ScenarioId, MissionResourceId, MissionPath } from './types.js';

/**
 * Creates a default scenario ID (uses the Campaign scenario)
 */
export function createDefaultScenarioId(): ScenarioId {
  return new ScenarioId("ECC61978EDCC2B5A", "Missions/23_Campaign.conf");
}

/**
 * Creates a scenario ID from components
 */
export function createScenarioId(resourceId: MissionResourceId, missionPath: MissionPath): ScenarioId {
  return new ScenarioId(resourceId, missionPath);
}

/**
 * Helper to create scenario from string with validation
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
 * Validates and normalizes a scenario string
 */
export function normalizeScenarioId(input: string | ScenarioId): string {
  if (typeof input === 'string') {
    const scenario = parseScenarioId(input);
    return scenario.toString();
  }
  return input.toString();
}
