# Integration Tests

This directory contains integration tests that build and execute the examples to ensure they work correctly as complete packages.

## Test Files

### `run-all.js`
Master test runner that executes all integration tests and provides a summary report.

### `config-validator.test.js`
Tests the config validator CLI example:
- ✅ Dependencies install correctly
- ✅ Project builds successfully  
- ✅ Valid configurations are accepted
- ✅ Invalid configurations are properly rejected
- ✅ Help command works
- ✅ Error handling works correctly
- ✅ npm scripts function properly

### `discord-bot.test.js`
Tests the Discord bot example:
- ✅ Dependencies install correctly
- ✅ Project builds successfully
- ✅ All required files are present
- ✅ TypeScript compilation works
- ✅ Main entry point compiles correctly
- ✅ Basic import/syntax validation passes

### `parser-example.test.js`
Tests the parser example:
- ✅ Example file exists and is accessible
- ✅ Example runs without errors
- ✅ Example produces expected output
- ✅ Example demonstrates key parser features

### `mod-extensions-example.test.js`
Tests the mod extensions example:
- ✅ Example file exists and is accessible
- ✅ Example runs without errors
- ✅ Example produces expected output
- ✅ Example demonstrates all key mod extension features
- ✅ Example produces valid workshop URLs

## Running Tests

### Run all integration tests:
```bash
npm run test:integration
```

### Run individual integration tests:
```bash
node test/integration/config-validator.test.js
node test/integration/discord-bot.test.js
node test/integration/parser-example.test.js
node test/integration/mod-extensions-example.test.js
```

### Run as part of full test suite:
```bash
npm test
```

## Test Structure

Each test follows this pattern:
1. **Setup validation** - Check required files exist
2. **Dependency installation** - `npm install` 
3. **Build process** - `npm run build`
4. **Functionality tests** - Test core features
5. **Error handling** - Test edge cases and error conditions
6. **Integration tests** - Test npm scripts and CLI commands

## Adding New Tests

To add a new integration test:
1. Create `[example-name].test.js` in this directory
2. Make it executable: `chmod +x [example-name].test.js`
3. Follow the existing pattern with proper test reporting
4. The `run-all.js` script will automatically discover and run it
