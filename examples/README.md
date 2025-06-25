# Examples

This directory contains example projects that demonstrate how to use the reforger-types library in real-world scenarios.

## 📁 Examples

### [config-validator](./config-validator/)
A complete TypeScript CLI tool for validating Arma Reforger server configuration files.

**Features:**
- Complete TypeScript package with proper project structure
- Commander.js CLI framework with argument parsing and help
- Chalk for colored terminal output with emojis
- Comprehensive validation using the library's parser with detailed error reporting
- Clear distinction between hard errors and warnings
- Proper exit codes for CI/CD integration

**Quick Start:**
```bash
cd config-validator
npm install
npm run build
npm start configs/valid-server.json
```

### [discord-bot](./discord-bot/)
A TypeScript Discord bot that creates Arma Reforger server configurations via slash commands.

**Features:**
- Discord.js integration with slash commands
- Interactive server configuration creation
- File output with automatic naming
- Decoupled service architecture for reusability
- Environment-based configuration
- Comprehensive validation and error handling

**Quick Start:**
```bash
cd discord-bot
npm install
# Set up .env file (see discord-bot/README.md)
npm run build
npm start
```

### Standalone Examples

- **[mod-extensions-example.js](./mod-extensions-example.js)** - Demonstrates mod utilities, workshop URL generation, and mod ID validation
- **[parser-example.js](./parser-example.js)** - Shows basic parser usage, validation options, and error handling

## 🚀 Getting Started

Each example directory contains:
- **`README.md`** - Detailed setup instructions and usage examples
- **`package.json`** - Dependencies, scripts, and project metadata
- **`tsconfig.json`** - TypeScript configuration (for TypeScript examples)
- **Example configuration files** - Sample valid and invalid configurations for testing
- **Well-documented source code** - Comprehensive examples with comments

### Running Examples

1. **Choose an example** from the list above
2. **Navigate to the directory**: `cd [example-name]`
3. **Install dependencies**: `npm install`
4. **Build (if TypeScript)**: `npm run build`
5. **Run the example**: Follow the specific instructions in each example's README

### Example Use Cases

- **Learning the API** - Start with the standalone examples (`parser-example.js`, `mod-extensions-example.js`)
- **CLI Tools** - See the config-validator for a complete CLI application
- **Discord Integration** - Use the discord-bot as a template for chat integrations
- **Web Applications** - The discord-bot's service layer can be adapted for web APIs
- **CI/CD Integration** - The config-validator shows proper exit codes for automated workflows

## 📖 Documentation

- **[Main README](../README.md)** - Library overview, installation, and quick start guide
- **[API Documentation](../docs/)** - Complete configuration reference and API documentation
- **Integration Tests** - See `../test/integration/` for automated example testing

## 💡 Contributing Examples

Have an interesting use case? We welcome example contributions! 

**Guidelines:**
- Include a comprehensive README with setup instructions
- Add proper error handling and validation
- Use TypeScript when possible for better documentation
- Include example configuration files
- Add integration tests in `../test/integration/`
