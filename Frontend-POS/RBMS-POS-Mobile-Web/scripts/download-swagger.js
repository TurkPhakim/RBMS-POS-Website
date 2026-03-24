const https = require('https');
const fs = require('fs');
const path = require('path');
const getApiUrl = require('./get-api-url');

const swaggerUrl = `${getApiUrl()}/swagger/v2/swagger.json`;
const outputPath = path.join(__dirname, '..', 'swagger.json');

console.log(`Downloading swagger from: ${swaggerUrl}`);

const options = {
  rejectUnauthorized: false,
};

https.get(swaggerUrl, options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    fs.writeFileSync(outputPath, data);
    console.log(`Swagger saved to: ${outputPath}`);
  });
}).on('error', (err) => {
  console.error('Error downloading swagger:', err.message);
  process.exit(1);
});
