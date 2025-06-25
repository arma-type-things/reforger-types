# Server Configuration Validator

A TypeScript CLI tool for validating Arma Reforger server configuration files using the reforger-types parser.

## Features

- **JSON Validation**: Validates JSON syntax and structure
- **Configuration Validation**: Comprehensive validation using the reforger-types parser
- **Error Reporting**: Clear distinction between hard errors and warnings
- **Pretty Output**: Color-coded output with emojis and detailed information
- **CLI Framework**: Built with Commander.js for proper argument parsing
- **Exit Codes**: Proper exit codes for CI/CD integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### Command Line

```bash
# Validate a configuration file
npm start configs/valid-server.json

# Or after building
node dist/cli.js configs/valid-server.json

# With debug output
node dist/cli.js --debug configs/problematic-server.json

# Show help
node dist/cli.js --help
```

### NPM Scripts

```bash
# Build and validate the example valid config
npm run validate:example

# Build and validate the problematic config (will show warnings/errors)
npm run validate:problematic

# Development mode (build and run)
npm run dev configs/valid-server.json
```

## Example Configurations

The `configs/` directory contains example configuration files:

- `valid-server.json` - A well-configured server with optimal settings
- `problematic-server.json` - A configuration with various issues to demonstrate validation

## Output Examples

### Valid Configuration
```
🔍 Validating Arma Reforger server configuration...
File: /path/to/configs/valid-server.json

✅ Configuration is valid!
No errors or warnings found.
```

### Configuration with Issues
```
🔍 Validating Arma Reforger server configuration...
File: /path/to/configs/problematic-server.json

📊 Validation Summary:
Errors: 2
Warnings: 4

🚨 ERRORS (2):
These issues prevent the server from starting properly.

1. ❌ ERROR: Bind port must be within valid range
   Field: bindPort
   Value: 99999
   Valid Range: 1024-65535

2. ❌ ERROR: RCON max clients exceeds maximum allowed
   Field: rcon.maxClients
   Value: 50
   Valid Range: 1-16

⚠️  WARNINGS (4):
These are recommendations for optimal server performance.

1. ⚠️ WARNING: Server name is empty or too short
   Field: game.name
   Recommendation: Use a descriptive server name (3-100 characters)

2. ⚠️ WARNING: RCON password is too weak
   Field: rcon.password
   Recommendation: Use a strong password with at least 12 characters

3. ⚠️ WARNING: Player count exceeds recommended maximum
   Field: game.playerCountLimit
   Value: 150
   Recommendation: Keep player count at or below 128 for optimal performance

4. ⚠️ WARNING: BattlEye is disabled
   Field: game.gameProperties.battlEye
   Recommendation: Enable BattlEye for better cheat protection

✨ Validation complete.
Configuration has errors that must be fixed.
```

## Exit Codes

- `0` - Configuration is valid (may have warnings)
- `1` - Configuration has errors or parsing failed

## Dependencies

- **chalk**: For colored terminal output
- **commander**: For CLI argument parsing and help generation
- **reforger-types**: The main validation library (local dependency)

## Integration

This CLI tool can be easily integrated into:

- **CI/CD Pipelines**: Use exit codes to fail builds with invalid configs
- **Pre-commit Hooks**: Validate configs before committing
- **Server Deployment**: Validate configs before starting servers
- **Configuration Management**: Batch validate multiple config files

## Development

The project structure follows TypeScript best practices:

```
src/
  cli.ts          # Main CLI application
configs/
  *.json          # Example configuration files
dist/             # Compiled JavaScript output
package.json      # Dependencies and scripts
tsconfig.json     # TypeScript configuration
```

Build the project with:
```bash
npm run build
```

The compiled output will be in the `dist/` directory.
