const dns = require('dns');

const host = 'db.dlpxciimpvqugavnitne.supabase.co';

console.log(`Resolving ${host}...`);

dns.resolve4(host, (err, addresses) => {
    if (err) console.error('IPv4 Error:', err);
    else console.log('IPv4 Addresses:', addresses);
});

dns.resolve6(host, (err, addresses) => {
    if (err) console.error('IPv6 Error (Expected if not supported):', err);
    else console.log('IPv6 Addresses:', addresses);
});
