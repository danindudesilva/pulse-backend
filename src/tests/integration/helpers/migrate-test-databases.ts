import 'dotenv/config';
import { execa } from 'execa';
import { getIntegrationDatabaseUrl } from './test-database-url.js';

const SUFFIXES = [
  'identity',
  'opportunities',
  'followups',
  'dashboard'
] as const;

async function main() {
  for (const suffix of SUFFIXES) {
    const databaseUrl = getIntegrationDatabaseUrl(suffix);

    console.log(`Applying migrations to ${databaseUrl}`);

    await execa('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
