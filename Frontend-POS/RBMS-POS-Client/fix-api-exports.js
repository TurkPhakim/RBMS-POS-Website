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
// Without this patch, nested objects (e.g. Addresses[], Educations[]) are sent as JSON Blobs
// which ASP.NET Core [FromForm] cannot bind → Backend receives null → data silently lost
const rbPath = path.join(__dirname, 'src/app/core/api/request-builder.ts');
if (fs.existsSync(rbPath)) {
  try {
    let rbContent = fs.readFileSync(rbPath, 'utf8');
    const rbOriginal = rbContent;

    // Use regex to match the multipart section's array handling (indentation-flexible)
    // Target: the "if (val instanceof Array)" block INSIDE the multipart/form-data section
    const oldPatternRegex = /( +)(if \(val instanceof Array\) \{\s*for \(const v of val\) \{\s*const toAppend = this\.formDataValue\(v\);\s*if \(toAppend !== null\) \{\s*formData\.append\(key, toAppend\);\s*\}\s*\})/;

    const match = rbContent.match(oldPatternRegex);

    if (match) {
      const indent = match[1]; // capture actual indentation
      const i2 = indent + '  '; // +2 spaces
      const i3 = indent + '    '; // +4 spaces
      const i4 = indent + '      '; // +6 spaces
      const i5 = indent + '        '; // +8 spaces

      const newPattern =
        `${indent}if (val instanceof Array) {\n` +
        `${i2}for (let i = 0; i < val.length; i++) {\n` +
        `${i3}const v = val[i];\n` +
        `${i3}if (v === null || v === undefined) continue;\n` +
        `${i3}if (v instanceof Blob) {\n` +
        `${i4}formData.append(key, v);\n` +
        `${i3}} else if (typeof v === 'object') {\n` +
        `${i4}for (const prop of Object.keys(v)) {\n` +
        `${i5}const propValue = (v as Record<string, unknown>)[prop];\n` +
        `${i5}if (propValue !== null && propValue !== undefined) {\n` +
        `${indent}          formData.append(\`\${key}[\${i}].\${prop}\`, String(propValue));\n` +
        `${i5}}\n` +
        `${i4}}\n` +
        `${i3}} else {\n` +
        `${i4}formData.append(key, String(v));\n` +
        `${i3}}\n` +
        `${i2}}`;

      // Preserve original line endings (CRLF or LF)
      const lineEnding = rbContent.includes('\r\n') ? '\r\n' : '\n';
      const finalPattern = newPattern.replace(/\n/g, lineEnding);

      rbContent = rbContent.replace(match[0], finalPattern);

      if (rbContent !== rbOriginal) {
        fs.writeFileSync(rbPath, rbContent, 'utf8');
        console.log('  [FIXED] request-builder.ts (nested array flattening for ASP.NET Core)');
      } else {
        console.error('  [ERROR] request-builder.ts: regex matched but replace produced identical content!');
        process.exit(1);
      }
    } else {
      // Check if already patched (look for our specific pattern in multipart section)
      const multipartIdx = rbContent.indexOf("'multipart/form-data'");
      const multipartSection = multipartIdx >= 0 ? rbContent.substring(multipartIdx, multipartIdx + 1000) : '';

      if (multipartSection.includes('for (let i = 0; i < val.length; i++)')) {
        console.log('  [OK] request-builder.ts already patched');
      } else {
        console.error('  [ERROR] request-builder.ts: could not find pattern to patch!');
        console.error('         The multipart/form-data array handling may have changed.');
        console.error('         Nested objects (Addresses, Educations, etc.) will NOT work with ASP.NET Core [FromForm].');
        console.error('         Please manually patch the array handling in request-builder.ts');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`  [FAILED] request-builder.ts: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('  [SKIP] request-builder.ts not found');
}

console.log('');
console.log('  Export fix completed.');
