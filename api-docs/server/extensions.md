# Server Module Extensions

Mod utilities and helper functions for workshop URL handling, mod ID validation, and mod object manipulation.

## Constants

### WORKSHOP_BASE_URL

Base URL for the Arma Reforger Workshop.

```typescript
const WORKSHOP_BASE_URL = 'https://reforger.armaplatform.com/workshop';
```

**Value:** `'https://reforger.armaplatform.com/workshop'`

## Extended Types

### ModExtended

Extended Mod interface with additional computed properties, particularly workshop URLs.

```typescript
interface ModExtended extends BaseMod {
  /**
   * Gets the workshop URL for this mod
   * Format: https://reforger.armaplatform.com/workshop/{modId}-{anyString}
   * The part after the dash is ignored, only modId matters
   */
  readonly url: string;
}
```

**Properties:**
- Inherits all properties from `Mod` interface
- `url` - Computed workshop URL for the mod

## Mod Creation Functions

### createExtendedMod

Creates an extended Mod object with computed properties like workshop URLs.

```typescript
function createExtendedMod(mod: BaseMod): ModExtended
```

**Parameters:**
- `mod` - Base mod object containing modId and optional metadata

**Returns:** `ModExtended` object with computed URL property

### createModExtendedFromUrl

Creates a ModExtended object from a workshop URL.

```typescript
function createModExtendedFromUrl(url: string): ModExtended | null
```

**Parameters:**
- `url` - Workshop URL containing mod ID

**Returns:** `ModExtended` object with extracted mod ID, or `null` if URL is invalid

**Supported URL formats:**
- `https://reforger.armaplatform.com/workshop/{modId}`
- `https://reforger.armaplatform.com/workshop/{modId}-{name}`
- `{modId}` (direct mod ID)

### createModExtendedListFromUrls

Creates a list of ModExtended objects from workshop URLs, filtering out invalid URLs.

```typescript
function createModExtendedListFromUrls(urls: string[]): ModExtended[]
```

**Parameters:**
- `urls` - Array of workshop URLs or mod IDs

**Returns:** Array of `ModExtended` objects (invalid URLs are skipped)

### createModListFromUrls

Creates a list of basic Mod objects from workshop URLs.

```typescript
function createModListFromUrls(urls: string[]): BaseMod[]
```

**Parameters:**
- `urls` - Array of workshop URLs or mod IDs

**Returns:** Array of basic `Mod` objects (invalid URLs are skipped)

## URL and ID Utilities

### getModWorkshopUrl

Gets the workshop URL for a mod object (overloaded function).

```typescript
function getModWorkshopUrl(mod: BaseMod): string;
function getModWorkshopUrl(mod: ModExtended): string;
```

**Parameters:**
- `mod` - Mod object (basic or extended)

**Returns:** Workshop URL string

**For ModExtended:** Returns the computed `url` property
**For BaseMod:** Generates URL from mod ID

### modIdFromUrl

Extracts mod ID from a workshop URL.

```typescript
function modIdFromUrl(url: string): string | null
```

**Parameters:**
- `url` - Workshop URL or direct mod ID

**Returns:** 16-character mod ID string, or `null` if invalid

**Supported formats:**
- Full URLs: `https://reforger.armaplatform.com/workshop/1234567890ABCDEF-mod-name`
- Mod ID only: `1234567890ABCDEF`

### isValidModId

Validates a mod ID format.

```typescript
function isValidModId(modId: string): boolean
```

**Parameters:**
- `modId` - String to validate as mod ID

**Returns:** `true` if valid 16-character hexadecimal string, `false` otherwise

**Valid format:** Exactly 16 characters, hexadecimal (0-9, A-F, case insensitive)

## Mod Name Utilities

### getEffectiveModName

Gets the effective name for a mod, providing a default if none exists.

```typescript
function getEffectiveModName(mod: BaseMod): string
```

**Parameters:**
- `mod` - Mod object

**Returns:** Mod's name if provided, otherwise generated default name

**Default name format:** `"Mod {last8chars}"` using the last 8 characters of the mod ID

## Conversion Utilities

### toBaseMod

Converts a ModExtended object to a basic Mod object.

```typescript
function toBaseMod(modExtended: ModExtended): BaseMod
```

**Parameters:**
- `modExtended` - Extended mod object

**Returns:** Basic `Mod` object without computed properties

### toBaseModList

Converts an array of ModExtended objects to basic Mod objects.

```typescript
function toBaseModList(modsExtended: ModExtended[]): BaseMod[]
```

**Parameters:**
- `modsExtended` - Array of extended mod objects

**Returns:** Array of basic `Mod` objects

## Usage Examples

### URL to Mod Conversion

```typescript
import { createModExtendedFromUrl, modIdFromUrl } from 'reforger-types';

// Create mod from URL
const mod = createModExtendedFromUrl(
  'https://reforger.armaplatform.com/workshop/1234567890ABCDEF-enhanced-realism'
);

// Extract just the ID
const modId = modIdFromUrl(
  'https://reforger.armaplatform.com/workshop/1234567890ABCDEF-enhanced-realism'
);
// Result: "1234567890ABCDEF"
```

### Bulk URL Processing

```typescript
import { createModExtendedListFromUrls } from 'reforger-types';

const urls = [
  'https://reforger.armaplatform.com/workshop/1234567890ABCDEF-mod-one',
  'https://reforger.armaplatform.com/workshop/FEDCBA0987654321-mod-two',
  'invalid-url-skipped'
];

const mods = createModExtendedListFromUrls(urls);
// Result: 2 valid mods, invalid URL filtered out
```

### Mod ID Validation

```typescript
import { isValidModId } from 'reforger-types';

console.log(isValidModId('1234567890ABCDEF')); // true
console.log(isValidModId('invalid-id'));       // false
console.log(isValidModId('123'));              // false (too short)
```

### Workshop URL Generation

```typescript
import { createExtendedMod, getModWorkshopUrl } from 'reforger-types';

const baseMod = { modId: '1234567890ABCDEF', name: 'My Mod' };
const extendedMod = createExtendedMod(baseMod);

console.log(extendedMod.url);                    // Uses computed property
console.log(getModWorkshopUrl(baseMod));         // Generates URL
console.log(getModWorkshopUrl(extendedMod));     // Uses computed property
```

### Name Resolution

```typescript
import { getEffectiveModName } from 'reforger-types';

const modWithName = { modId: '1234567890ABCDEF', name: 'Custom Name' };
const modWithoutName = { modId: '1234567890ABCDEF' };

console.log(getEffectiveModName(modWithName));    // "Custom Name"
console.log(getEffectiveModName(modWithoutName)); // "Mod 90ABCDEF"
```
