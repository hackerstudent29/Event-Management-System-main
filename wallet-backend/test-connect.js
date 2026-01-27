const { Client } = require('pg');

const client = new Client({
    host: 'db.dlpxciimpvqugavnitne.supabase.co',
    user: 'postgres',
    password: 'RAMAZENDRUM',
    database: 'postgres',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

console.log('Testing connection...');
client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Query result:', res.rows[0]);
        client.end();
    })
    .catch(err => {
        console.error('Connection failed:', err);
        client.end();
    });
