// Reforger Types - TypeScript definitions for Arma Reforger server configuration

import * as servers from './servers/index.js';
import * as scenario from './scenario/index.js';

// Export the namespaces
export { servers, scenario };

// Re-export for backward compatibility and convenience
export const SupportedPlatform = servers.SupportedPlatform;

// Export default initializer functions for convenience
export const createDefaultServerConfig = servers.createDefaultServerConfig;
export const createDefaultGameConfig = servers.createDefaultGameConfig;
export const createDefaultGameProperties = servers.createDefaultGameProperties;
export const createDefaultOperatingConfig = servers.createDefaultOperatingConfig;
export const createDefaultA2SConfig = servers.createDefaultA2SConfig;
export const createDefaultRconConfig = servers.createDefaultRconConfig;
export const createDefaultMissionHeader = servers.createDefaultMissionHeader;

// Export builder pattern classes
export const ServerConfigBuilder = servers.ServerConfigBuilder;

// Type-only exports for TypeScript users
export type A2SConfig = servers.A2SConfig;
export type RconConfig = servers.RconConfig;
export type MissionHeader = servers.MissionHeader;
export type MissionHeaderValue = servers.MissionHeaderValue;
export type Mod = servers.Mod;
export type GameProperties = servers.GameProperties;
export type GameConfig = servers.GameConfig;
export type OperatingConfig = servers.OperatingConfig;
export type ServerConfig = servers.ServerConfig;
export type IServerConfigBuilder = servers.IServerConfigBuilder;

// Export scenario utilities for convenience
export const MissionResourceReference = scenario.MissionResourceReference;
export const ScenarioId = scenario.ScenarioId;
export const OfficialScenarios = scenario.OfficialScenarios;
export const createDefaultScenarioId = scenario.createDefaultScenarioId;
export const createScenarioId = scenario.createScenarioId;
export const parseScenarioId = scenario.parseScenarioId;

// Type-only exports for scenarios
export type MissionResourceId = scenario.MissionResourceId;
export type MissionPath = scenario.MissionPath;
export type OfficialScenarioName = scenario.OfficialScenarioName;
