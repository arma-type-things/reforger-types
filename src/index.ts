// Reforger Types - TypeScript definitions for Arma Reforger server configuration

import * as server from './server/index.js';
import * as scenario from './scenario/index.js';

// Export the namespaces
export { server, scenario };

// Re-export for backward compatibility and convenience
export const SupportedPlatform = server.SupportedPlatform;

// Export default initializer functions for convenience
export const createDefaultServerConfig = server.createDefaultServerConfig;
export const createDefaultGameConfig = server.createDefaultGameConfig;
export const createDefaultGameProperties = server.createDefaultGameProperties;
export const createDefaultOperatingConfig = server.createDefaultOperatingConfig;
export const createDefaultA2SConfig = server.createDefaultA2SConfig;
export const createDefaultRconConfig = server.createDefaultRconConfig;
export const createDefaultMissionHeader = server.createDefaultMissionHeader;

// Export builder pattern classes
export const ServerConfigBuilder = server.ServerConfigBuilder;

// Export parser functions
export const ServerConfigParser = server.ServerConfigParser;
export const parseServerConfig = server.parseServerConfig;
export const validateServerConfig = server.validateServerConfig;
export const ParserWarningType = server.ParserWarningType;
export const ParserErrorType = server.ParserErrorType;

// Export mod extension functions
export const createExtendedMod = server.createExtendedMod;
export const getModWorkshopUrl = server.getModWorkshopUrl;
export const modIdFromUrl = server.modIdFromUrl;
export const isValidModId = server.isValidModId;
export const getEffectiveModName = server.getEffectiveModName;
export const createModExtendedFromUrl = server.createModExtendedFromUrl;
export const createModExtendedListFromUrls = server.createModExtendedListFromUrls;
export const createModListFromUrls = server.createModListFromUrls;
export const toBaseMod = server.toBaseMod;
export const toBaseModList = server.toBaseModList;
export const WORKSHOP_BASE_URL = server.WORKSHOP_BASE_URL;

// Type-only exports for TypeScript users
export type A2SConfig = server.A2SConfig;
export type RconConfig = server.RconConfig;
export type MissionHeader = server.MissionHeader;
export type MissionHeaderValue = server.MissionHeaderValue;
export type Mod = server.Mod;
export type ModExtended = server.ModExtended;
export type GameProperties = server.GameProperties;
export type GameConfig = server.GameConfig;
export type OperatingConfig = server.OperatingConfig;
export type ServerConfig = server.ServerConfig;
export type IServerConfigBuilder = server.IServerConfigBuilder;
export type ParseResult<T> = server.ParseResult<T>;
export type ParserOptions = server.ParserOptions;
export type ParserWarning = server.ParserWarning;

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
