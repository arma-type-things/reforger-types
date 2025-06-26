import { ThemeColors, type ThemeColorKey } from './constants.js';

export class ThemeManager {
  private console: Console;

  constructor(consoleRef: Console = console) {
    this.console = consoleRef;
  }

  /**
   * Apply foreground and background colors to text using the new color structure
   */
  private applyColors(text: string, colorKey: ThemeColorKey): string {
    const colorDef = ThemeColors[colorKey];
    let result = text;

    // Apply foreground color if defined
    if (colorDef.foreground) {
      result = colorDef.foreground(result);
    }

    // Apply background color if defined (check if property exists)
    if ('background' in colorDef && colorDef.background) {
      result = colorDef.background(result);
    }

    return result;
  }

  /**
   * Print text using a specific theme color
   */
  print(text: string, colorKey: ThemeColorKey): void {
    this.console.log(this.applyColors(text, colorKey));
  }

  /**
   * Print text with multiple color segments
   */
  printMixed(...segments: Array<{ text: string; colorKey: ThemeColorKey }>): void {
    const coloredSegments = segments.map(segment => 
      this.applyColors(segment.text, segment.colorKey)
    );
    this.console.log(coloredSegments.join(''));
  }

  /**
   * Print text with a prefix in one color and body in another
   */
  printWithPrefix(prefix: string, body: string, prefixColorKey: ThemeColorKey, bodyColorKey: ThemeColorKey): void {
    this.console.log(this.applyColors(prefix, prefixColorKey) + this.applyColors(body, bodyColorKey));
  }

  /**
   * Print a labeled value (label: value format)
   */
  printLabelValue(label: string, value: string, labelColorKey: ThemeColorKey = 'bodyColor', valueColorKey: ThemeColorKey = 'valueColor'): void {
    this.console.log(this.applyColors(label, labelColorKey) + this.applyColors(value, valueColorKey));
  }

  /**
   * Print plain text without color
   */
  printPlain(text: string): void {
    this.console.log(text);
  }

  /**
   * Print empty line
   */
  printLine(): void {
    this.console.log();
  }

  /**
   * Print error message
   */
  printError(message: string): void {
    this.console.error(this.applyColors('❌ Error: ', 'errorColor') + message);
  }

  /**
   * Apply colors to text without printing (for use by LayoutManager)
   */
  applyColorsToText(text: string, colorKey: ThemeColorKey): string {
    return this.applyColors(text, colorKey);
  }
}
