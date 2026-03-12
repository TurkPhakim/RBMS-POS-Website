/**
 * Download swagger.json จาก backend API
 * อ่าน URL จาก environment.ts อัตโนมัติ (ไม่ต้อง hardcode)
 */
const { execSync } = require('child_process');
const apiUrl = require('./get-api-url');

const swaggerUrl = `${apiUrl}/swagger/v2/swagger.json`;
console.log(`Downloading swagger from: ${swaggerUrl}`);
execSync(`curl -k -o swagger.json ${swaggerUrl}`, { stdio: 'inherit' });
