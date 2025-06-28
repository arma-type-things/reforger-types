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

You can specify mods to load on your server using the `--mods` option:

```bash
node dist/index.js --mods "59F0B6EA44FA0442,A123B456C789DEF0"
```

- Mod IDs must be 16-character hexadecimal strings
- Multiple mods are separated by commas
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

