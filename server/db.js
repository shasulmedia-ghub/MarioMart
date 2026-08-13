const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
    console.error("❌ PostgreSQL Pool Error:", err);
});

module.exports = pool;