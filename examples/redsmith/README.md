# Redsmith

An interactive forge for crafting Arma Reforger server configuration files.

*Redsmith* - a portmanteau of "Reforger" and "blacksmith" - helps you forge perfect server configurations through an intuitive command-line interface.

## Features

- Interactive step-by-step configuration
- Support for official scenarios
- Automatic port calculation (A2S and RCON)
- Mission header customization
- Simple numbered menu selection
- Default value suggestions

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
npm start
```

Or run directly:

```bash
node dist/index.js
```

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

## Requirements

- Node.js 18.0.0 or higher
- reforger-types library
