import chalk from 'chalk';

// Color definition structure
export interface ColorDefinition {
  foreground?: typeof chalk;
  background?: typeof chalk;
}

// Theme color definitions
export const ThemeColors = {
  bodyColor: { 
    foreground: chalk.hex('#D3D3D3')
  },
  boldBodyColor: { 
    foreground: chalk.bold.hex('#D3D3D3')
  },
  brandColor: { 
    foreground: chalk.bold.hex('#8B0000')
  },
  bannerColor: { 
    foreground: chalk.hex('#0A0A0A'),
    background: chalk.bgWhiteBright
  },
  lineColor: { 
    foreground: chalk.hex('#0A0A0A')
  },
  valueColor: { 
    foreground: chalk.hex('#191970')
  },
  successColor: { 
    foreground: chalk.hex('#006400')
  },
  errorColor: { 
    foreground: chalk.hex('#8B0000')
  },
  dimColor: { 
    foreground: chalk.dim
  }
} as const satisfies Record<string, ColorDefinition>;

// Type for theme color keys
export type ThemeColorKey = keyof typeof ThemeColors;
