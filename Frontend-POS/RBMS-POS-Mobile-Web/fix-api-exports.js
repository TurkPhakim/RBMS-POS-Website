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
    console.log(`  [SKIP] File not found: ${filePath}`);
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
      console.log(`  [FIXED] ${filePath}`);
    } else {
      console.log(`  [OK] Already correct: ${filePath}`);
    }
  } catch (error) {
    console.error(`  [FAILED] ${filePath}: ${error.message}`);
  }
});

// --- Fix RequestBuilder: flatten nested object arrays for ASP.NET Core model binding ---
const rbPath = path.join(__dirname, 'src/app/core/api/request-builder.ts');
if (fs.existsSync(rbPath)) {
  try {
    let rbContent = fs.readFileSync(rbPath, 'utf8');
    const rbOriginal = rbContent;

    // Replace the default array handling in multipart/form-data
    // Original: appends each array element as JSON Blob (incompatible with ASP.NET Core)
    // Fixed: flattens nested objects to key[index].property format
    const oldPattern = `          if (val instanceof Array) {
            for (const v of val) {
              const toAppend = this.formDataValue(v);
              if (toAppend !== null) {
                formData.append(key, toAppend);
              }
            }`;

    const newPattern = `          if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
              const v = val[i];
              if (v === null || v === undefined) continue;
              if (v instanceof Blob) {
                formData.append(key, v);
              } else if (typeof v === 'object') {
                for (const prop of Object.keys(v)) {
                  const propValue = (v as Record<string, unknown>)[prop];
                  if (propValue !== null && propValue !== undefined) {
                    formData.append(\`\${key}[\${i}].\${prop}\`, String(propValue));
                  }
                }
              } else {
                formData.append(key, String(v));
              }
            }`;

    if (rbContent.includes('for (const v of val)')) {
      rbContent = rbContent.replace(oldPattern, newPattern);
      if (rbContent !== rbOriginal) {
        fs.writeFileSync(rbPath, rbContent, 'utf8');
        console.log('  [FIXED] request-builder.ts (nested array flattening for ASP.NET Core)');
      }
    } else {
      console.log('  [OK] request-builder.ts already patched');
    }
  } catch (error) {
    console.error(`  [FAILED] request-builder.ts: ${error.message}`);
  }
} else {
  console.log('  [SKIP] request-builder.ts not found');
}

console.log('');
console.log('  Export fix completed.');
