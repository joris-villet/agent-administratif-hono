// import { drizzle } from 'drizzle-orm/node-postgres'
// export const db = drizzle(process.env.DATABASE_URL as string)
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });
// export const db = drizzle(pool);
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql });
