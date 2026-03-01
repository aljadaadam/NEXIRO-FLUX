UPDATE users SET role='user' WHERE id=20;
SELECT id,name,email,role,site_key FROM users WHERE role='admin';
