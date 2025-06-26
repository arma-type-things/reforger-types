// Parser ES Module Tests - Focus on imports/exports and basic functionality
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  Parser,
  parse,
  parser
} from '../dist/index.js';

describe('Parser ES Module Exports', () => {
  test('should export Parser class', () => {
    assert.strictEqual(typeof Parser, 'function');
    assert.strictEqual(Parser.name, 'Parser');
  });

  test('should export parse function', () => {
    assert.strictEqual(typeof parse, 'function');
    assert.strictEqual(parse.name, 'parse');
  });

  test('should export parser instance', () => {
    assert.ok(parser);
    assert.strictEqual(typeof parser.parse, 'function');
  });

  test('should create Parser instances', () => {
    const customParser = new Parser();
    assert.ok(customParser instanceof Parser);
  });
});

describe('Parser Integration', () => {
  test('should parse simple object', () => {
    const result = parse({ test: 'value' });
    assert.strictEqual(typeof result, 'object');
    assert.ok('success' in result);
  });

  test('should handle parse options', () => {
    const result = parse({ test: 'value' }, { validate: false });
    assert.strictEqual(typeof result, 'object');
    assert.ok('success' in result);
  });

  test('should use parser instance', () => {
    const result = parser.parse({ test: 'value' });
    assert.strictEqual(typeof result, 'object');
    assert.ok('success' in result);
  });
});
