#!/usr/bin/env node

/**
 * Migration Runner
 * Executes SQL migration files against the database
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function runMigration(filename) {
    const filepath = path.join(__dirname, 'migrations', filename);

    if (!fs.existsSync(filepath)) {
        console.error(`❌ Migration file not found: ${filename}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(filepath, 'utf8');

    console.log(`\n🚀 Running migration: ${filename}`);
    console.log('─'.repeat(50));

    try {
        await pool.query(sql);
        console.log(`✅ Migration completed successfully`);
    } catch (error) {
        console.error(`❌ Migration failed:`, error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('📦 Payment Gateway Migration Runner');
        console.log('─'.repeat(50));
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log('');

        await runMigration('001_payment_gateway.sql');

        console.log('\n✨ All migrations completed!');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    }
}

main();
