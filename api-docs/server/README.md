# Server Module

Comprehensive TypeScript definitions and utilities for Arma Reforger server configuration. The server module provides type-safe interfaces, builder patterns, and helper functions for creating, validating, and managing server configurations.

## Module Files

- **[types.md](./types.md)** - Core type definitions and interfaces
- **[defaults.md](./defaults.md)** - Default value creation functions  
- **[builder.md](./builder.md)** - Builder pattern for server configuration
- **[extensions.md](./extensions.md)** - Mod utilities, configuration file loading, and helper functions

## Overview

The server module is designed around the main `ServerConfig` interface, which contains all configuration sections needed for an Arma Reforger dedicated server. Use the builder pattern for interactive configuration creation, the default functions for quick setup with sensible defaults, or the file loading utilities to work with existing configuration files.
