const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    user: 'postgres.dlpxciimpvqugavnitne',
    password: 'RAMAZENDRUM',
    database: 'postgres',
    port: 5432,
});

async function checkEvents() {
    try {
        const res = await pool.query('SELECT name, latitude, longitude FROM events');
        console.log('Events in DB:', res.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await pool.end();
    }
}

checkEvents();
