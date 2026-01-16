-- Update admin@eventbooking.com to ADMIN role
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@eventbooking.com';

-- Verify the update
SELECT id, name, email, role, is_verified 
FROM users 
WHERE email = 'admin@eventbooking.com';
