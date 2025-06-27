# Integration Testing Tools

This directory contains utilities for preparing example packages for integration testing.

## Tools

### `prep-for-integration-testing.js`

Temporarily updates a single example's `package.json` to use local file references or revert to published versions. **Automatically handles npm install and build steps.**

**Usage:**
```bash
# Prepare single example for local testing (with automatic npm install + build)
node tools/prep-for-integration-testing.js config-validator

# Revert single example to published version (with automatic npm install + build)  
node tools/prep-for-integration-testing.js config-validator --revert

# Update package.json only (skip npm install and build)
node tools/prep-for-integration-testing.js config-validator --skip-install
```

### `prep-all-examples.js`

Batch processes all examples with `package.json` files. **Automatically handles npm install and build steps for all examples.**

**Usage:**
```bash
# Prepare all examples for local testing (with automatic npm install + build)
node tools/prep-all-examples.js

# Revert all examples to published versions (with automatic npm install + build)
node tools/prep-all-examples.js --revert

# Update all package.json files only (skip npm install and build)
node tools/prep-all-examples.js --skip-install
```

## Workflow

1. **Before integration testing:**
   ```bash
   # Make sure you've built the project
   npm run build
   
   # Prepare examples to use local development version (auto-installs dependencies)
   node tools/prep-all-examples.js
   ```

2. **Run integration tests:**
   ```bash
   npm run test:integration
   ```

3. **After integration testing:**
   ```bash
   # Revert examples back to published versions (auto-installs dependencies)
   node tools/prep-all-examples.js --revert
   ```

## How it works

- **Local mode**: Updates `"reforger-types": "^x.x.x"` → `"reforger-types": "file:../.."`
- **Revert mode**: Fetches current published version from npm and updates `"reforger-types": "file:../.."` → `"reforger-types": "^x.x.x"`

The tools automatically detect the currently published version using `npm view reforger-types version`.
