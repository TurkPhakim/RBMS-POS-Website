/**
 * อ่าน apiUrl จาก environment.ts
 * - require('./get-api-url') → return URL string
 * - node get-api-url.js → print URL
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const content = fs.readFileSync(envPath, 'utf8');
const match = content.match(/apiUrl:\s*['"]([^'"]+)['"]/);

if (!match) {
  console.error('ERROR: apiUrl not found in environment.ts');
  process.exit(1);
}

module.exports = match[1];

if (require.main === module) {
  process.stdout.write(match[1]);
}
