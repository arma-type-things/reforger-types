# Discord Bot Server Configuration Example

This example demonstrates a complete Discord bot implementation for creating Arma Reforger server configurations.

## 🎯 Key Features

- **Complete Slash Command Support**: Many server configuration options available as Discord options
- **Environment Configuration**: Output directory configurable via `CONFIG_OUTPUT_DIR`

## 🏗️ Architecture Overview

```
src/
├── bot.ts                    # Main bot entry point
├── types/index.ts           # Shared TypeScript interfaces
├── services/
│   └── ServerConfigService.ts  # Core business logic (reusable)
├── commands/
│   └── CreateServerCommand.ts  # Discord slash command handler
└── utils/
    └── validation.ts        # Utility functions
```

## 🚀 Quick Start

1. **Setup Environment**:
```bash
npm install discord.js @types/node dotenv reforger-types
cp .env.example .env
# Edit .env with your bot token and guild ID
```

2. **Build and Run**:
```bash
npm run build
npm start
```

3. **Use the Command**:
```
/create-server scenario:{ECC61978EDCC2B5A}Missions/23_Campaign.conf name:"My Server"
```

## 🔧 Slash Command Options

### Required
- `scenario` - Full scenario ID string (e.g., `{ECC61978EDCC2B5A}Missions/23_Campaign.conf`)

### Core Server Settings (Optional)
- `name` - Server display name
- `max-players` - Maximum players (1-128)
- `bind-port` - Server port (1024-65535)
- `bind-address` - Bind IP address

### Game Settings (Optional)
- `password` - Server password
- `admin-password` - Admin password
- `cross-platform` - Enable console crossplay
- `visible` - Show in server browser

### Advanced Game Properties (Optional)
- `battleye` - Enable BattlEye anti-cheat
- `fast-validation` - Enable fast validation
- `disable-third-person` - Force first-person only
- `von-disable-ui` - Disable VON UI
- `von-disable-direct-speech` - Disable direct speech UI
- `von-cross-faction` - Allow cross-faction VON
- `server-max-view-distance` - Max view distance (500-10000)
- `network-view-distance` - Network view distance (500-5000)
- `server-min-grass-distance` - Min grass distance (0 or 50-150)

## 💡 Usage Examples

### Basic Server
```
/create-server scenario:{ECC61978EDCC2B5A}Missions/23_Campaign.conf name:"Community Server"
```

### Competitive Setup
```
/create-server scenario:{6EA2E454519E5869}Missions/CAH_Military_Base.conf name:"Clan Battle" max-players:32 disable-third-person:true battleye:true
```

### Large-Scale Warfare
```
/create-server scenario:{ECC61978EDCC2B5A}Missions/23_Campaign.conf name:"Massive Warfare" max-players:128 cross-platform:true server-max-view-distance:2500
```

### Training Server
```
/create-server scenario:{002AF7323E0129AF}Missions/Tutorial.conf name:"Training Ground" max-players:16 visible:false
```

## 🔄 Reusability

The `ServerConfigService` class is completely decoupled from Discord and can be reused in:

### Web API Example
```typescript
import { ServerConfigService } from './services/ServerConfigService';

const configService = new ServerConfigService('./configs');

app.post('/api/servers', async (req, res) => {
  const result = await configService.createServerConfig(req.body);
  
  if (result.success) {
    res.json({ success: true, file: result.fileName });
  } else {
    res.status(400).json({ error: result.error });
  }
});
```

### CLI Tool Example
```typescript
import { ServerConfigService } from './services/ServerConfigService';
import { program } from 'commander';

const configService = new ServerConfigService('./configs');

program
  .option('--scenario <scenario>', 'Scenario ID')
  .option('--name <name>', 'Server name')
  .option('--max-players <count>', 'Max players')
  .action(async (options) => {
    const result = await configService.createServerConfig(options);
    console.log(result.success ? `Created: ${result.fileName}` : `Error: ${result.error}`);
  });
```

### Configuration GUI Example
```typescript
// React component example
const [formData, setFormData] = useState<ServerConfigOptions>({
  scenario: '',
  name: '',
  maxPlayers: 64
});

const handleSubmit = async () => {
  const result = await configService.createServerConfig(formData);
  if (result.success) {
    alert(`Configuration saved: ${result.fileName}`);
  } else {
    alert(`Error: ${result.error}`);
  }
};
```

## 🛠️ Extending the Bot

### Add New Commands
```typescript
// commands/ListServersCommand.ts
export class ListServersCommand {
  public readonly data = new SlashCommandBuilder()
    .setName('list-servers')
    .setDescription('List all server configurations');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Implementation
  }
}

// Register in bot.ts
const listServersCommand = new ListServersCommand();
commands.set(listServersCommand.data.name, listServersCommand);
```

### Add Configuration Templates
```typescript
// services/ServerTemplateService.ts
export class ServerTemplateService {
  static readonly TEMPLATES = {
    COMPETITIVE: {
      maxPlayers: 32,
      disableThirdPerson: true,
      battleye: true,
      fastValidation: true
    },
    CASUAL: {
      maxPlayers: 64,
      crossPlatform: true,
      disableThirdPerson: false
    },
    TRAINING: {
      maxPlayers: 16,
      scenario: OfficialScenarios.TUTORIAL,
      visible: false
    }
  };

  static applyTemplate(options: ServerConfigOptions, templateName: string) {
    const template = this.TEMPLATES[templateName];
    return { ...template, ...options };
  }
}
```

## 📁 File Output

Generated files are saved to the directory specified by `CONFIG_OUTPUT_DIR` with the format:
```
{server-name-sanitized}-{timestamp}.json
```

Example: `my-awesome-server-2024-06-25T10-30-00.json`

## 🚀 Production Deployment

### Docker Example
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/bot.js"]
```

### Environment Variables
```env
DISCORD_TOKEN=your_bot_token
GUILD_ID=your_guild_id
CONFIG_OUTPUT_DIR=/app/configs
NODE_ENV=production
```