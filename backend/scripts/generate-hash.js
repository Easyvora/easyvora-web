/**
 * Genera el bcrypt hash para ADMIN_PASS_HASH en .env
 * Uso: node scripts/generate-hash.js tu_password
 */
const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/generate-hash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nCopia esto en tu .env:\n');
  console.log(`ADMIN_PASS_HASH=${hash}\n`);
});
