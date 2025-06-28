// Reforger Types - TypeScript definitions for Arma Reforger server configuration

import * as server from './server/index.js';
import * as scenario from './scenario/index.js';
import * as parser from './parser/index.js';

// Export the namespaces
export { server, scenario, parser };

// Re-export for convenience
export const SupportedPlatform = server.SupportedPlatform;

// Export main server config creation function
export const createDefaultServerConfig = server.createDefaultServerConfig;

// Export builder pattern classes
export const ServerConfigBuilder = server.ServerConfigBuilder;

// Export parser API
export const ParserWarningType = parser.ParserWarningType;
export const ParserErrorType = parser.ParserErrorType;
export const Parser = parser.Parser;
export const parse = parser.parse;

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
export const dedupModList = server.dedupModList;
export const loadServerConfigFromFile = server.loadServerConfigFromFile;
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
export type ParseResult<T> = parser.ParseResult<T>;
export type ParserWarning = parser.ParserWarning;
export type ParserError = parser.ParserError;

// Export scenario utilities for convenience
export const MissionResourceReference = scenario.MissionResourceReference;
export const ScenarioId = scenario.ScenarioId;
export const ScenarioIdExtended = scenario.ScenarioIdExtended;
export const OfficialScenarios = scenario.OfficialScenarios;
export const createDefaultScenarioId = scenario.createDefaultScenarioId;
export const createScenarioId = scenario.createScenarioId;
export const parseScenarioId = scenario.parseScenarioId;

// Type-only exports for scenarios
export type MissionResourceId = scenario.MissionResourceId;
export type MissionPath = scenario.MissionPath;
export type OfficialScenarioName = scenario.OfficialScenarioName;
export type ScenarioMetadata = scenario.ScenarioMetadata;
