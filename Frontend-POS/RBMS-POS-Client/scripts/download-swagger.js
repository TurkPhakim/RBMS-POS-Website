/**
 * Download swagger.json จาก backend API
 * อ่าน URL จาก environment.ts อัตโนมัติ (ไม่ต้อง hardcode)
 */
const { execSync } = require('child_process');
const apiUrl = require('./get-api-url');

const swaggerUrl = `${apiUrl}/swagger/v2/swagger.json`;

console.log('');
console.log('  gen-api: Download Swagger');
console.log('  -------------------------');
console.log(`  URL: ${swaggerUrl}`);
console.log('');

try {
  execSync(`curl -k -s -f -o swagger.json ${swaggerUrl}`, { stdio: 'pipe' });
  console.log('  [SUCCESS] swagger.json downloaded.');
  console.log('');
} catch (error) {
  console.error('  [FAILED] Could not download swagger.json.');
  console.error('');
  console.error('  Possible causes:');
  console.error('    - Backend is not running (dotnet run)');
  console.error(`    - Backend is not listening on ${apiUrl}`);
  console.error('    - Swagger endpoint is not available');
  console.error('');
  process.exit(1);
}
