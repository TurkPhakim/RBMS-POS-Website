/**
 * Fix API export statements for TypeScript isolatedModules
 *
 * ng-openapi-gen generates `export { Type }` which causes TS1205 error
 * when isolatedModules is enabled. This script converts them to `export type { Type }`.
 *
 * Run after generating API client: npm run gen-api
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/core/api/models.ts'
  // Note: services.ts should NOT be fixed - services are classes, not types
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Fix export statements: export { Type } -> export type { Type }
    // Only for TypeScript interfaces/types (not classes)
    content = content.replace(/^export \{ /gm, 'export type { ');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`✓  Already correct: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('\n✨ API export statements fixed!');
