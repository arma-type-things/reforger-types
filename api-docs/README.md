# API Documentation

Comprehensive API reference for the reforger-types library. This documentation covers all modules, types, functions, and utilities available in the library.

## Modules

### [Server Module](./server/)
Core server configuration types, builder patterns, and mod utilities.

- **[Types](./server/types.md)** - ServerConfig, GameConfig, and all configuration interfaces
- **[Defaults](./server/defaults.md)** - Default creation functions with sensible defaults
- **[Builder](./server/builder.md)** - Fluent API builder for step-by-step configuration creation
- **[Extensions](./server/extensions.md)** - Mod utilities and workshop URL helpers

### [Parser Module](./parser/)
Parsing and validation system for server configurations.

- **[Types](./parser/types.md)** - Error types, warning types, and result interfaces
- **[Constants](./parser/constants.md)** - Validation constants and thresholds
- **[Parser](./parser/parser.md)** - Main Parser class and convenience functions
- **[Validator](./parser/validator.md)** - Business logic validation engine

### [Scenario Module](./scenario/)
Mission resource reference utilities and scenario handling.

- **[Types](./scenario/types.md)** - Mission resource reference types and classes
- **[Defaults](./scenario/defaults.md)** - Default scenario creation utilities

## Getting Started

For quick start examples and basic usage, see the main [README](../README.md). For complete working examples, explore the [examples folder](../examples/).

Each module documentation includes:
- Complete API coverage with TypeScript signatures
- Detailed parameter and return value documentation
- Practical usage examples from basic to advanced
- Cross-references between related functions and types
