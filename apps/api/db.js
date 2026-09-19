import { Pool } from "pg";
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized:false } });
export const query = (text, params) => pool.query(text, params);
