# Examples

This directory contains example projects that demonstrate how to use the reforger-types library.

## 📁 Examples

### [config-validator](./config-validator/)
A complete TypeScript CLI tool for validating Arma Reforger server configuration files.

**Features:**
- Complete TypeScript package with proper structure
- Commander.js CLI framework with argument parsing
- Chalk for colored terminal output
- Comprehensive validation with detailed error reporting
- Support for both validation errors and warnings
- Proper exit codes for CI/CD integration

**Usage:**
```bash
cd config-validator
npm install
npm run build
npm start configs/valid-server.json
```

### [discord-bot](./discord-bot/)
A TypeScript Discord bot that creates Arma Reforger server configurations via slash commands.

**Features:**
- Discord.js integration
- Slash command interface
- Server configuration builder integration
- Environment-based configuration

### Additional Examples

- `mod-extensions-example.js` - Demonstrates mod extension utilities
- `parser-example.js` - Basic parser usage example

## 🚀 Getting Started

Each example directory contains:
- `README.md` - Detailed setup and usage instructions
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (for TS examples)
- Example configuration files
- Source code with comprehensive examples

## 📖 Documentation

For detailed API documentation, see the main [README.md](../README.md) and [docs/](../docs/) directory.
