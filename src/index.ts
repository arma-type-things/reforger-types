// Reforger Types - TypeScript definitions for Arma Reforger server configuration

import * as servers from './servers/index.js';
import * as modules from './modules/index.js';

// Export the namespaces
export { servers, modules };

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

// Export module utilities for convenience
export const MissionResourceReference = modules.MissionResourceReference;
export const ScenarioId = modules.ScenarioId;
export const OfficialScenarios = modules.OfficialScenarios;
export const createDefaultScenarioId = modules.createDefaultScenarioId;
export const createScenarioId = modules.createScenarioId;
export const parseScenarioId = modules.parseScenarioId;

// Type-only exports for modules
export type MissionResourceId = modules.MissionResourceId;
export type MissionPath = modules.MissionPath;
export type OfficialScenarioName = modules.OfficialScenarioName;
