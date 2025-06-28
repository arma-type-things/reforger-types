# Redsmith

Generate, automate, and validate Arma Reforger server configuration files with an interactive wizard or command-line tools.

## Quick Start

**No installation required** - run directly with npx:

```bash
npx redsmith
```

*Note: Requires Node.js to be installed on your system.*

## Usage

### Interactive Wizard

As above, run without any options to start the interactive wizard:

```bash
npx redsmith
```

The wizard will guide you through creating a complete server configuration file.

### Command Line

Generate configurations directly with command-line options:

```bash
npx redsmith --name "My Server" --scenario conflict-everon --port 2001 --output-file server.json --yes
```

### Common Options

- `--name <name>` - Server name
- `--scenario <scenario>` - Scenario (use `npx redsmith list-scenarios` to see options)
- `--port <port>` - Server port
- `--output-file <path>` - Where to save the configuration
- `--yes` - Skip confirmations for automation
- `--validate` - Validate the generated configuration

### Examples

**Create a basic server:**
```bash
npx redsmith --name "Weekend Warriors" --scenario conflict-everon --port 2001 --output-file server.json --yes
```

**Server with mods:**
```bash
npx redsmith --name "Modded Server" --scenario conflict-everon --mods "59F0B6EA44FA0442,A123B456C789DEF0" --output-file server.json --yes
```

**Load mods from file:**
```bash
npx redsmith --name "Community Server" --mod-list-file my-mods.txt --output-file server.json --yes
```

**Validate existing configuration:**
```bash
npx redsmith validate server.json
```

## Mod Support

Redsmith supports loading mods in multiple ways:

**Command line:** `--mods "modid1,modid2"`  
**From file:** `--mod-list-file mods.txt`

**Example mod list file (mods.txt):**
```
59F0B6EA44FA0442
A123B456C789DEF0
DEADBEEFDEADBEEF
```

## Extract Mods from Existing Config

Extract mod lists from existing server configurations:

```bash
# Extract to stdout (JSON format)
npx redsmith extract mods server.json

# Extract to file with format detection
npx redsmith extract mods server.json mods.txt
npx redsmith extract mods server.json mods.csv

# Specify output format
npx redsmith extract mods server.json --output yaml
```

## Requirements

- Node.js (any recent version)
- Internet connection for npx to download redsmith

