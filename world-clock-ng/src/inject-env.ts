const writeFile = require('fs').writeFile;
const targetPath = './src/environments/environment.ts';
require('dotenv').config();
const envContent = `
export const environment = {
  production: false,
  apiKey: ${process.env.API_KEY ? '"' + process.env.API_KEY + '"' : 'undefined'}
};
`;

writeFile(targetPath, envContent, (err: any) => {
  if (err) {
    throw console.error(err);
  } else {
    console.log('environment.ts generated');
  }
});
