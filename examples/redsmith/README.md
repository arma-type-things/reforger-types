# Redsmith

An interactive forge for crafting Arma Reforger server configuration files.

## Features

- Interactive step-by-step configuration
- Support for official scenarios
- Automatic port calculation (A2S and RCON)
- Mission header customization
- Simple numbered menu selection
- Default value suggestions
- Built-in validation with detailed reporting

## Installation

```bash
npm install
npm run build
```

## Usage

### Interactive Mode

```bash
npm start
```

Or run directly:

```bash
node dist/index.js
```

### Command Line Options

You can pre-fill configuration values using command line options:

```bash
node dist/index.js --name "My Server" --scenario conflict-everon --port 2001
```

Available options:
- `--name <name>` - Server name
- `--bind-address <address>` - Bind IP address
- `--public-address <address>` - Public IP address
- `--port <port>` - Bind port number
- `--scenario <scenario>` - Scenario name (see supported scenarios below)
- `--mission-name <name>` - Mission name
- `--mission-author <author>` - Mission author
- `--save-file <filename>` - Save file name
- `--mods <mods>` - Comma-separated list of mod IDs (16-character hex strings)
- `--mod-list-file <path>` - Path to file containing mod IDs (supports JSON, YAML, text, and CSV formats)
- `--output <path>` - Output file path
- `--yes` - Skip confirmation prompt and proceed automatically
- `--force` - Allow overwriting existing files and skip confirmation
- `--validate` - Run validation after saving the configuration file

### Non-Interactive Mode

Use `--yes` for automated scripting:

```bash
node dist/index.js --name "Auto Server" --scenario conflict-everon --port 2001 --output server.json --yes
```

Use `--force` to overwrite existing files:

```bash
node dist/index.js --output existing-file.json --force --yes
```

Use `--validate` to immediately validate the generated configuration:

```bash
node dist/index.js --name "Test Server" --scenario conflict-everon --port 2001 --validate
```

### Discovering Available Scenarios

Use the `list-scenarios` command to see all supported scenario codes:

```bash
node dist/index.js list-scenarios
```

### Mod Support

You can specify mods to load on your server in two ways:

#### Command Line Mods

Use the `--mods` option for a quick list of mod IDs:

```bash
node dist/index.js --mods "59F0B6EA44FA0442,A123B456C789DEF0"
```

#### Mod List Files

Use the `--mod-list-file` option to load mods from a file:

```bash
node dist/index.js --mod-list-file "path/to/my-mods.json"
```

**Supported File Formats:**
- [x] **JSON** - Array of mod objects with optional metadata
- [x] **YAML** - YAML format with optional metadata (supports both .yaml and .yml extensions)
- [x] **Text** - Line-separated mod IDs (one per line)
- [ ] **CSV** - Comma-separated values (planned)

**JSON Format Example:**
```json
[
  {
    "modId": "59F0B6EA44FA0442",
    "name": "My Favorite Mod",
    "version": "1.0.0",
    "required": true
  },
  {
    "modId": "A123B456C789DEF0"
  }
]
```

**YAML Format Example:**
```yaml
- modId: "59F0B6EA44FA0442"
  name: "My Favorite Mod"
  version: "1.0.0"
  required: true
  
- modId: "A123B456C789DEF0"
  # This mod has minimal metadata
```

**Text Format Example:**
```
59F0B6EA44FA0442
A123B456C789DEF0
DEADBEEFDEADBEEF
```

#### Combining Sources

You can combine both methods - mods from CLI and file will be merged automatically:

```bash
node dist/index.js --mods "59F0B6EA44FA0442" --mod-list-file "additional-mods.txt"
```

**Important Notes:**
- Mod IDs must be 16-character hexadecimal strings
- Duplicate mod IDs are automatically removed
- Invalid mod IDs will be ignored with a warning
- Mod IDs can be copied directly from the Reforger Workshop page for the mod

## Configuration Steps

The wizard will guide you through:

1. **Basic Server Settings**
   - Server name
   - Bind address (IP to bind to)
   - Bind port (main server port)

2. **Scenario Selection**
   - Choose from official Arma Reforger scenarios
   - Conflict, Combat Ops, and Game Master modes

3. **Mission Header Settings**
   - Mission name
   - Mission author
   - Save file name

4. **Output Configuration**
   - Specify where to save the configuration file

## Example Output

The wizard generates a complete `server.json` file that can be used directly with an Arma Reforger dedicated server.

## Supported Scenarios

- Conflict (Everon, Northern Everon, Southern Everon, Western Everon, Montignac, Arland)
- Combat Ops (Arland, Everon)
- Game Master (Everon, Arland)

## Validation

Redsmith includes built-in validation capabilities:

```bash
# Validate any configuration file
npx redsmith validate path/to/server.json

# With debug output for troubleshooting
npx redsmith validate path/to/server.json --debug
```

## Requirements

- Node.js 22+ for optimal compatibility
- reforger-types library

