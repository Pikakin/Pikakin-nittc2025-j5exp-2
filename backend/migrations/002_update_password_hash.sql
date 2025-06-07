USE timetable_system;

-- 正しいパスワードハッシュで更新（password123）
UPDATE users SET password_hash = '$2a$10$2VxYMPHn01tZjQ2TLRyQpODDvntE74qm921.zcYHKShw1lyUIaJOu' WHERE email = 'admin@example.com';
UPDATE users SET password_hash = '$2a$10$2VxYMPHn01tZjQ2TLRyQpODDvntE74qm921.zcYHKShw1lyUIaJOu' WHERE email = 'teacher1@example.com';
UPDATE users SET password_hash = '$2a$10$2VxYMPHn01tZjQ2TLRyQpODDvntE74qm921.zcYHKShw1lyUIaJOu' WHERE email = 'teacher2@example.com';
UPDATE users SET password_hash = '$2a$10$2VxYMPHn01tZjQ2TLRyQpODDvntE74qm921.zcYHKShw1lyUIaJOu' WHERE email = 'student1@example.com';