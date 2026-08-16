import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Connected to CockroachDB. Dropping existing tables...');
    
    const tables = [
      'Message',
      'Memory',
      'Scenario',
      'Npc',
      'Conversation',
      'Persona',
      'Character',
      '_prisma_migrations'
    ];

    for (const t of tables) {
      try {
        await client.query(`ALTER TABLE "${t}" SET (schema_locked = false);`);
      } catch (e) {
        // ignore if table doesn't exist
      }
    }

    for (const t of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
        console.log(`Dropped table "${t}"`);
      } catch (e) {
        console.warn(`Failed to drop "${t}":`, e.message);
      }
    }

    console.log('Database cleaned successfully!');
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
