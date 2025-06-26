# Parser Module

Comprehensive parsing and validation system for Arma Reforger server configurations. The parser module provides type-safe parsing, business logic validation, and detailed error reporting.

## Module Files

- **[types.md](./types.md)** - Error types, warning types, and result interfaces
- **[constants.md](./constants.md)** - Validation constants and thresholds
- **[parser.md](./parser.md)** - Main Parser class and convenience functions
- **[validator.md](./validator.md)** - Business logic validation engine

## Overview

The parser module handles the complete parsing workflow from raw input to validated [ServerConfig](../server/types.md#serverconfig) objects. It provides both strict validation for production environments and flexible validation for development scenarios with customizable warning and error filtering.
