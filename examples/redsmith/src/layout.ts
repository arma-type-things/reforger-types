import boxen from 'boxen';
import { ThemeManager } from './theme.js';
import { type ThemeColorKey } from './constants.js';

// Layout configuration types
export interface BoxConfig {
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { top?: number; bottom?: number; left?: number; right?: number };
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
  borderColor?: ThemeColorKey;
  backgroundColor?: ThemeColorKey;
  textAlign?: 'left' | 'center' | 'right';
  title?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
}

export interface TextSegment {
  text: string;
  colorKey: ThemeColorKey;
}

export interface LayoutConfig {
  box?: BoxConfig;
  segments?: TextSegment[];
}

export class LayoutManager {
  private console: Console;
  private theme: ThemeManager;

  constructor(consoleRef: Console = console) {
    this.console = consoleRef;
    this.theme = new ThemeManager(consoleRef);
  }

  /**
   * Convert theme color key to actual color for boxen
   */
  private getBoxenColor(colorKey: ThemeColorKey): string {
    const colorMap: Record<ThemeColorKey, string> = {
      bodyColor: 'gray',
      boldBodyColor: 'gray',
      brandColor: '#8B0000',
      bannerColor: 'black',
      lineColor: 'black',
      valueColor: 'blue',
      successColor: 'green',
      errorColor: 'red',
      dimColor: 'gray'
    };
    return colorMap[colorKey] || 'gray';
  }

  /**
   * Print text using theme colors (proxy to ThemeManager)
   */
  print(text: string, colorKey: ThemeColorKey): void {
    this.theme.print(text, colorKey);
  }

  /**
   * Print mixed text segments (proxy to ThemeManager)
   */
  printMixed(...segments: TextSegment[]): void {
    this.theme.printMixed(...segments);
  }

  /**
   * Print text with a prefix (proxy to ThemeManager)
   */
  printWithPrefix(prefix: string, body: string, prefixColorKey: ThemeColorKey, bodyColorKey: ThemeColorKey): void {
    this.theme.printWithPrefix(prefix, body, prefixColorKey, bodyColorKey);
  }

  /**
   * Print labeled value (proxy to ThemeManager)
   */
  printLabelValue(label: string, value: string, labelColorKey?: ThemeColorKey, valueColorKey?: ThemeColorKey): void {
    this.theme.printLabelValue(label, value, labelColorKey, valueColorKey);
  }

  /**
   * Print plain text (proxy to ThemeManager)
   */
  printPlain(text: string): void {
    this.theme.printPlain(text);
  }

  /**
   * Print empty line (proxy to ThemeManager)
   */
  printLine(): void {
    this.theme.printLine();
  }

  /**
   * Print error message (proxy to ThemeManager)
   */
  printError(message: string): void {
    this.theme.printError(message);
  }

  /**
   * Print text in a box with layout configuration
   */
  printBox(text: string, config: BoxConfig = {}): void {
    const boxenOptions: Parameters<typeof boxen>[1] = {
      padding: config.padding || 1,
      margin: config.margin || 0,
      borderStyle: config.borderStyle || 'single',
      textAlignment: config.textAlign || 'left',
      ...(config.title && { title: config.title }),
      ...(config.titleAlignment && { titleAlignment: config.titleAlignment }),
      ...(config.borderColor && { borderColor: this.getBoxenColor(config.borderColor) }),
      ...(config.backgroundColor && { backgroundColor: this.getBoxenColor(config.backgroundColor) }),
      ...(config.width && { width: config.width }),
      ...(config.height && { height: config.height })
    };

    const boxedText = boxen(text, boxenOptions);
    this.console.log(boxedText);
  }

  /**
   * Print mixed text segments in a box
   */
  printMixedBox(segments: TextSegment[], config: BoxConfig = {}): void {
    // Apply theme colors to each segment using the exposed method
    const coloredSegments = segments.map(segment => 
      this.theme.applyColorsToText(segment.text, segment.colorKey)
    );
    const combinedText = coloredSegments.join('');
    
    this.printBox(combinedText, config);
  }

  /**
   * Print a layout using configuration object
   */
  printLayout(layoutConfig: LayoutConfig): void {
    if (layoutConfig.segments && layoutConfig.box) {
      // Mixed text in a box
      this.printMixedBox(layoutConfig.segments, layoutConfig.box);
    } else if (layoutConfig.segments) {
      // Mixed text without box
      this.printMixed(...layoutConfig.segments);
    } else if (layoutConfig.box) {
      // Empty box (separator/divider)
      this.printBox('', layoutConfig.box);
    }
  }

  /**
   * Print a section header with consistent styling
   */
  printSectionHeader(title: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: 'single',
      borderColor: 'lineColor',
      textAlign: 'center'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printBox(title, mergedConfig);
  }

  /**
   * Print a banner with bold uppercase title
   */
  printBanner(title: string, subtitle?: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'lineColor',
      textAlign: 'center'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    
    if (subtitle) {
      const segments: TextSegment[] = [
        { text: title.toUpperCase(), colorKey: 'boldBodyColor' },
        { text: '\n', colorKey: 'bodyColor' },
        { text: subtitle, colorKey: 'bodyColor' }
      ];
      this.printMixedBox(segments, mergedConfig);
    } else {
      this.printMixedBox([{ text: title.toUpperCase(), colorKey: 'boldBodyColor' }], mergedConfig);
    }
  }

  /**
   * Print a branded banner with Redsmith branding and custom message
   */
  printBrandedBanner(message: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'brandColor',
      textAlign: 'center',
      title: 'REDSMITH',
      titleAlignment: 'left'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    
    // Just display the message, the title is handled by boxen's title property
    this.printMixedBox([{ text: message, colorKey: 'dimColor' }], mergedConfig);
  }

  /**
   * Print an info box with consistent styling
   */
  printInfoBox(message: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'valueColor'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printMixedBox([{ text: message, colorKey: 'bodyColor' }], mergedConfig);
  }

  /**
   * Print a success box
   */
  printSuccessBox(message: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'successColor'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printMixedBox([{ text: message, colorKey: 'successColor' }], mergedConfig);
  }

  /**
   * Print an error box
   */
  printErrorBox(message: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'bold',
      borderColor: 'errorColor'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printMixedBox([{ text: '❌ ' + message, colorKey: 'errorColor' }], mergedConfig);
  }

  /**
   * Print an error banner with configurable title and content inside the banner
   */
  printErrorBanner(content: string, title?: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'bold',
      borderColor: 'errorColor',
      width: 80,
      ...(title && { title: title, titleAlignment: 'left' })
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printMixedBox([{ text: content, colorKey: 'errorColor' }], mergedConfig);
  }

  /**
   * Print a warning banner with configurable title and content inside the banner
   */
  printWarningBanner(content: string, title?: string, config: BoxConfig = {}): void {
    const defaultConfig: BoxConfig = {
      padding: 1,
      borderStyle: 'bold',
      borderColor: 'valueColor',
      width: 80,
      ...(title && { title: title, titleAlignment: 'left' })
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    this.printMixedBox([{ text: content, colorKey: 'valueColor' }], mergedConfig);
  }

  /**
   * Get the underlying ThemeManager for advanced usage
   */
  getThemeManager(): ThemeManager {
    return this.theme;
  }
}
