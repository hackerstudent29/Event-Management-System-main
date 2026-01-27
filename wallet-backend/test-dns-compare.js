const dns = require('dns');

const host1 = 'db.dlpxciimpvqugavnitne.supabase.co';
const host2 = 'aws-0-ap-south-1.pooler.supabase.com'; // Trying standard pooler DNS

console.log(`Resolving ${host1}...`);
dns.resolve(host1, (err, addresses) => {
    console.log(`${host1} (Any):`, addresses);
});

console.log(`Resolving ${host2}...`);
dns.resolve(host2, (err, addresses) => {
    console.log(`${host2} (Any):`, addresses);
});
