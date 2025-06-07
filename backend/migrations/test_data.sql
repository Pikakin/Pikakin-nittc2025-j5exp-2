-- テスト用ユーザーデータ
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理者', 'admin'),
('teacher@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '教員', 'teacher'),
('student@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '学生', 'student');

-- パスワードは全て "password" です

-- テスト用クラスデータ
INSERT INTO classes (grade, class_name) VALUES
(1, '1'),
(1, '2'),
(2, '1'),
(2, '2');

-- テスト用科目データ
INSERT INTO subjects (code, name, category, term, credits) VALUES
('110001', '英語1A', '一般', '前期', 2),
('110002', '数学1', '一般', '通年', 4),
('150014', 'コンピュータ概論', '専門', '前期', 2);