// Centralized path references for redsmith integration tests
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base paths
export const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
export const EXAMPLES_DIR = path.join(PROJECT_ROOT, 'examples');
export const REDSMITH_DIR = path.join(EXAMPLES_DIR, 'redsmith');
export const CONFIG_VALIDATOR_DIR = path.join(EXAMPLES_DIR, 'config-validator');

// Redsmith specific paths
export const REDSMITH_DIST_PATH = path.join(REDSMITH_DIR, 'dist', 'index.js');
export const REDSMITH_SRC_PATH = path.join(REDSMITH_DIR, 'src');
export const REDSMITH_TEST_INPUTS = path.join(REDSMITH_DIR, 'test', 'inputs');

// Test input files
export const TEST_FILES = {
  JSON_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods.json'),
  TXT_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods.txt'),
  CSV_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods.csv'),
  CSV_MINIMAL_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods-minimal.csv'),
  YAML_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods.yaml'),
  YML_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods.yml'),
  JSON_COMPAT_YAML_MODS: path.join(REDSMITH_TEST_INPUTS, 'test-mods-json-compat.yaml')
};

// Config validator test files
export const CONFIG_VALIDATOR_CONFIGS = {
  VALID: path.join(CONFIG_VALIDATOR_DIR, 'configs', 'valid-server.json'),
  PROBLEMATIC: path.join(CONFIG_VALIDATOR_DIR, 'configs', 'problematic-server.json'),
  MALFORMED: path.join(CONFIG_VALIDATOR_DIR, 'configs', 'malformed.json')
};
