require('dotenv').config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  driver: "pg", // ✅ este es el valor correcto para PostgreSQL
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};


