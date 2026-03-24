const fs = require('fs');
const path = require('path');

function getApiUrl() {
  const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/apiUrl:\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not find apiUrl in environment.ts');
  }
  return match[1];
}

module.exports = getApiUrl;
