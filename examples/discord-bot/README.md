# Discord Bot Example

A TypeScript Discord bot that allows users to create Arma Reforger server configurations through slash commands.

## Features

- Create server configurations via Discord slash commands
- Configurable output directory via environment variables
- Decoupled architecture for easy reuse
- Comprehensive validation and error handling
- Support for all major server configuration options

## Setup

1. Install dependencies:
```bash
npm install discord.js @types/node dotenv
```

2. Create a `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
CONFIG_OUTPUT_DIR=./server-configs
```

3. Build and run:
```bash
npx tsc
node dist/bot.js
```

## Usage

Use the `/create-server` slash command with these options:

### Required
- `scenario` - The scenario ID (e.g., `{ECC61978EDCC2B5A}Missions/23_Campaign.conf`)

### Optional
- `name` - Server name (default: "Discord Server")
- `max-players` - Maximum players (1-128, default: 64)
- `bind-port` - Server bind port (1024-65535, default: 2001)
- `bind-address` - Server bind address (default: "0.0.0.0")
- `password` - Server password
- `admin-password` - Admin password
- `cross-platform` - Enable cross-platform play (default: false)
- `visible` - Show in server browser (default: true)
- `battleye` - Enable BattlEye (default: true)
- `fast-validation` - Enable fast validation (default: true)
- `disable-third-person` - Force first-person only (default: false)
- `von-disable-ui` - Disable VON UI (default: false)
- `von-disable-direct-speech` - Disable direct speech UI (default: false)
- `von-cross-faction` - Allow cross-faction VON (default: false)
- `server-max-view-distance` - Max view distance (500-10000, default: 1600)
- `network-view-distance` - Network view distance (500-5000, default: 1500)
- `server-min-grass-distance` - Min grass distance (0 or 50-150, default: 0)

## Architecture

- `bot.ts` - Main bot entry point and slash command registration
- `commands/` - Command handlers (decoupled from business logic)
- `services/` - Business logic services (reusable)
- `types/` - TypeScript interfaces and types
- `utils/` - Utility functions
