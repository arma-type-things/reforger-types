#!/usr/bin/env node

/**
 * Demo script to show redsmith validation in action.
 * Run this to see interactive validation working.
 */

console.log(`
🧪 Redsmith Validation Demo
===========================

This script demonstrates the validation improvements made to redsmith:

1. File Path Validation:
   ✅ Must end with .json extension
   ✅ Cannot contain invalid characters (<>:"|?*)
   ✅ Basic directory path format validation

2. String Input Validation:
   ✅ Cannot be empty (after trimming)
   ✅ Must be at least 1 character
   ✅ Must be 256 characters or less
   ✅ Automatically trims whitespace

3. IP Address Validation:
   ✅ Validates IP format (xxx.xxx.xxx.xxx)
   ✅ Validates octet ranges (0-255)
   ✅ Cannot be empty

4. Number Validation:
   ✅ Port range validation (1024-65535)
   ✅ Type validation (must be number)

🚀 To test interactively:
   cd examples/redsmith
   npm run build
   node dist/index.js

Try entering:
- Empty strings (should be rejected)
- File paths without .json (should be rejected)
- Invalid IP addresses like "999.999.999.999" (should be rejected)
- Ports outside 1024-65535 range (should be rejected)

The validation ensures better UX and prevents invalid configurations!
`);
