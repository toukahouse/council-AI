const { execSync } = require('child_process');
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('Success!');
} catch (err) {
  console.error('Failed:', err);
}
