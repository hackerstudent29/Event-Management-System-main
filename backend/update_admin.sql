-- Update ramanathanb86@gmail.com to ADMIN role
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'ramanathanb86@gmail.com';

-- Verify the update
SELECT id, name, email, role, is_verified 
FROM users 
WHERE email = 'ramanathanb86@gmail.com';
