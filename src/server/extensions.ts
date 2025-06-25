/**
 * Extensions for server types that add computed properties and helper methods
 */

import { Mod as BaseMod } from './types';

/**
 * Base URL for the Arma Reforger Workshop
 */
export const WORKSHOP_BASE_URL = 'https://reforger.armaplatform.com/workshop';

/**
 * Generates a default name for a mod when none is provided
 * Uses last 8 hex characters to create a shorter, JS-safe identifier
 * @param modId - The mod ID to generate a name for
 * @returns A default name in the format "Mod {last8chars}"
 */
function generateDefaultModName(modId: string): string {
  // Use last 8 characters for shorter, safer identifier
  const shortId = modId.slice(-8);
  return `Mod ${shortId}`;
}

/**
 * Gets the effective name for a mod, providing a default if none exists
 * @param mod - BaseMod object
 * @returns The mod's name or a generated default name
 */
export function getEffectiveModName(mod: BaseMod): string {
  return (mod.name && mod.name.trim() !== '') ? mod.name : generateDefaultModName(mod.modId);
}

/**
 * Extended Mod interface with additional computed properties
 */
export interface ModExtended extends BaseMod {
  /**
   * Gets the workshop URL for this mod
   * Format: https://reforger.armaplatform.com/workshop/{modId}-{anyString}
   * The part after the dash is ignored, only modId matters
   */
  readonly url: string;
}

/**
 * Creates an extended Mod object with computed properties
 */
/**
 * Creates an extended Mod object with computed properties like workshop URLs
 * @param mod - Base mod object containing modId and optional metadata
 * @returns ModExtended object with additional computed properties
 */
export function createExtendedMod(mod: BaseMod): ModExtended {
  return {
    ...mod,
    get url(): string {
      return getModWorkshopUrl(mod);
    }
  };
}

/**
 * Generates a workshop URL for a mod
 * @param mod - BaseMod object containing modId and name
 * @returns Full workshop URL
 */
export function getModWorkshopUrl(mod: BaseMod): string;

/**
 * Generates a workshop URL for a mod
 * @param mod - ModExtended object containing modId and name
 * @returns Full workshop URL
 */
export function getModWorkshopUrl(mod: ModExtended): string;

export function getModWorkshopUrl(mod: BaseMod | ModExtended): string {
  const effectiveName = getEffectiveModName(mod);
  const sanitizedName = sanitizeUrlName(effectiveName);
  return `${WORKSHOP_BASE_URL}/${mod.modId}-${sanitizedName}`;
}

/**
 * Sanitizes a mod name for use in URLs
 * Removes special characters and replaces spaces with no separator
 */
function sanitizeUrlName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .substring(0, 50); // Limit length
}

/**
 * Parses a mod ID from a workshop URL
 * @param url - Workshop URL
 * @returns Mod ID if valid, null otherwise
 */
export function modIdFromUrl(url: string): string | null {
  const match = url.match(new RegExp(`${WORKSHOP_BASE_URL}\/([A-F0-9]+)-.*`));
  return match ? match[1] : null;
}

/**
 * Validates if a string is a valid mod ID (16 character hex string)
 */
/**
 * Validates if a string is a valid Arma Reforger mod ID
 * @param modId - String to validate
 * @returns True if the string is a valid 16-character uppercase hex mod ID
 */
export function isValidModId(modId: string): boolean {
  return /^[A-F0-9]{16}$/.test(modId);
}

/**
 * Creates a ModExtended object directly from a workshop URL
 * @param url - Workshop URL
 * @returns ModExtended object or null if URL is invalid
 */
export function createModExtendedFromUrl(url: string): ModExtended | null {
  const modId = modIdFromUrl(url);
  if (!modId || !isValidModId(modId)) {
    return null;
  }

  // Extract name from URL (part after the dash)
  const urlParts = url.split('-');
  const urlName = urlParts.length > 1 ? urlParts.slice(1).join('-') : undefined;
  
  // Create minimal mod object - user can add version/required as needed
  const baseMod: BaseMod = {
    modId
  };
  
  // Only include name if we could extract it from URL
  if (urlName && urlName.trim() !== '') {
    baseMod.name = urlName;
  }
  
  return createExtendedMod(baseMod);
}

/**
 * Creates a list of ModExtended objects from workshop URLs
 * @param urls - Array of workshop URLs
 * @returns Array of ModExtended objects (empty if no valid URLs)
 */
export function createModExtendedListFromUrls(urls: string[]): ModExtended[] {
  if (!urls || urls.length === 0) {
    return [];
  }
  
  return urls
    .map(url => createModExtendedFromUrl(url))
    .filter((mod): mod is ModExtended => mod !== null);
}

/**
 * Creates a list of Mod objects from workshop URLs
 * @param urls - Array of workshop URLs
 * @returns Array of Mod objects (empty if no valid URLs)
 */
export function createModListFromUrls(urls: string[]): BaseMod[] {
  if (!urls || urls.length === 0) {
    return [];
  }
  
  return urls
    .map(url => {
      const modExtended = createModExtendedFromUrl(url);
      return modExtended ? toBaseMod(modExtended) : null;
    })
    .filter((mod): mod is BaseMod => mod !== null);
}

/**
 * Converts a ModExtended back to a BaseMod (removes computed properties)
 * @param modExtended - ModExtended object
 * @returns BaseMod object
 */
export function toBaseMod(modExtended: ModExtended): BaseMod {
  const { modId, name, version, required } = modExtended;
  const baseMod: BaseMod = { modId };
  
  // Only include optional properties if they exist
  if (name !== undefined) {
    baseMod.name = name;
  }
  if (version !== undefined) {
    baseMod.version = version;
  }
  if (required !== undefined) {
    baseMod.required = required;
  }
  
  return baseMod;
}

/**
 * Converts a list of ModExtended objects back to BaseMod objects
 * @param modsExtended - Array of ModExtended objects
 * @returns Array of BaseMod objects
 */
export function toBaseModList(modsExtended: ModExtended[]): BaseMod[] {
  return modsExtended.map(mod => toBaseMod(mod));
}
