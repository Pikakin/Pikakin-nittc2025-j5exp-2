-- サンプルデータ投入マイグレーション

-- 科目データ投入（担当者サンプル.csvベース）
INSERT INTO subjects (code, name, term, credits) VALUES
-- 基本科目
('110001', '英語1A', 'first', 2),
('110002', '体育1', 'full', 2),
('150014', '情報', 'first', 2),
('110011', '総合1', 'full', 2),
-- 追加科目（時間割サンプル.csvから抽出）
('110003', '英語1B', 'second', 2),
('110004', '国語1A', 'first', 2),
('110005', '国語1B', 'second', 2),
('110006', '数学1A', 'first', 4),
('110007', '数学1B', 'second', 4),
('110008', '化学1', 'first', 2),
('110009', '地学生物', 'first', 2),
('110010', '地理', 'first', 2)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), 
term = VALUES(term), 
credits = VALUES(credits);

-- 修正版: ON DUPLICATE KEY UPDATEまたはINSERT IGNOREを使用

-- テストユーザー（重複回避）
INSERT IGNORE INTO users (email, password_hash, name, role) VALUES
('admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理者', 'admin'),
('teacher@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '教員', 'teacher'),
('student@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '学生', 'student');

-- 教員データ投入（重複回避）
INSERT INTO users (email, password_hash, name, role) VALUES
('eigo.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '英語太郎', 'teacher'),
('taiiku.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '体育太郎', 'teacher'),
('taiiku.jiro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '体育次郎', 'teacher'),
('joho.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '情報太郎', 'teacher'),
('kokugo.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '国語太郎', 'teacher'),
('sugaku.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '数学太郎', 'teacher'),
('kagaku.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '化学太郎', 'teacher'),
('chiri.taro@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '地理太郎', 'teacher')
ON DUPLICATE KEY UPDATE 
name = VALUES(name);


-- 時間割データ投入（時間割サンプル.csvベース）

-- 1-1クラスの時間割
-- 月曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(1, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'monday', 1, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '体育1'), (SELECT id FROM users WHERE name = '体育太郎'), 'monday', 2, '体育館'),
(1, (SELECT id FROM subjects WHERE name = '国語1B'), (SELECT id FROM users WHERE name = '国語太郎'), 'monday', 3, '1-1HR');

-- 火曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(1, (SELECT id FROM subjects WHERE name = '化学1'), (SELECT id FROM users WHERE name = '化学太郎'), 'tuesday', 1, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'tuesday', 2, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '英語1B'), (SELECT id FROM users WHERE name = '英語太郎'), 'tuesday', 3, '1-1HR');

-- 水曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(1, (SELECT id FROM subjects WHERE name = '数学1B'), (SELECT id FROM users WHERE name = '数学太郎'), 'wednesday', 1, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'wednesday', 2, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '国語1A'), (SELECT id FROM users WHERE name = '国語太郎'), 'wednesday', 3, '1-1HR');

-- 木曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(1, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 1, '共用教室（大）'),
(1, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 2, '共用教室（大）'),
(1, (SELECT id FROM subjects WHERE name = '地学生物'), (SELECT id FROM users WHERE name = '化学太郎'), 'thursday', 3, '1-1HR');

-- 金曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(1, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'friday', 1, '1-1HR'),
(1, (SELECT id FROM subjects WHERE name = '情報'), (SELECT id FROM users WHERE name = '情報太郎'), 'friday', 2, 'コンピュータ室'),
(1, (SELECT id FROM subjects WHERE name = '地理'), (SELECT id FROM users WHERE name = '地理太郎'), 'friday', 3, '1-1HR');

-- 1-2クラスの時間割
-- 月曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(2, (SELECT id FROM subjects WHERE name = '数学1B'), (SELECT id FROM users WHERE name = '数学太郎'), 'monday', 1, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '地学生物'), (SELECT id FROM users WHERE name = '化学太郎'), 'monday', 2, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '英語1B'), (SELECT id FROM users WHERE name = '英語太郎'), 'monday', 3, '1-2HR');

-- 火曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(2, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'tuesday', 1, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'tuesday', 2, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '体育1'), (SELECT id FROM users WHERE name = '体育太郎'), 'tuesday', 3, '体育館');

-- 水曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(2, (SELECT id FROM subjects WHERE name = '地理'), (SELECT id FROM users WHERE name = '地理太郎'), 'wednesday', 1, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '国語1A'), (SELECT id FROM users WHERE name = '国語太郎'), 'wednesday', 2, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'wednesday', 3, '1-2HR');

-- 木曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(2, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 1, '共用教室（大）'),
(2, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 2, '共用教室（大）'),
(2, (SELECT id FROM subjects WHERE name = '化学1'), (SELECT id FROM users WHERE name = '化学太郎'), 'thursday', 3, '1-2HR');

-- 金曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(2, (SELECT id FROM subjects WHERE name = '国語1B'), (SELECT id FROM users WHERE name = '国語太郎'), 'friday', 1, '1-2HR'),
(2, (SELECT id FROM subjects WHERE name = '情報'), (SELECT id FROM users WHERE name = '情報太郎'), 'friday', 2, 'コンピュータ室'),
(2, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'friday', 3, '1-2HR');

-- 1-3クラスの時間割
-- 月曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(3, (SELECT id FROM subjects WHERE name = '国語1A'), (SELECT id FROM users WHERE name = '国語太郎'), 'monday', 1, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '地理'), (SELECT id FROM users WHERE name = '地理太郎'), 'monday', 2, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'monday', 3, '1-3HR');

-- 火曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(3, (SELECT id FROM subjects WHERE name = '英語1B'), (SELECT id FROM users WHERE name = '英語太郎'), 'tuesday', 1, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '体育1'), (SELECT id FROM users WHERE name = '体育太郎'), 'tuesday', 2, '体育館'),
(3, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'tuesday', 3, '1-3HR');

-- 水曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(3, (SELECT id FROM subjects WHERE name = '化学1'), (SELECT id FROM users WHERE name = '化学太郎'), 'wednesday', 1, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '数学1B'), (SELECT id FROM users WHERE name = '数学太郎'), 'wednesday', 2, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '国語1B'), (SELECT id FROM users WHERE name = '国語太郎'), 'wednesday', 3, '1-3HR');

-- 木曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(3, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 1, '共用教室（大）'),
(3, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 2, '共用教室（大）'),
(3, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'thursday', 3, '1-3HR');

-- 金曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(3, (SELECT id FROM subjects WHERE name = '情報'), (SELECT id FROM users WHERE name = '情報太郎'), 'friday', 1, 'コンピュータ室'),
(3, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'friday', 2, '1-3HR'),
(3, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'friday', 3, '1-3HR');

-- 1-4クラスの時間割（続き）
-- 月曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(4, (SELECT id FROM subjects WHERE name = '化学1'), (SELECT id FROM users WHERE name = '化学太郎'), 'monday', 1, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '国語1B'), (SELECT id FROM users WHERE name = '国語太郎'), 'monday', 2, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'monday', 3, '1-4HR');

-- 火曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(4, (SELECT id FROM subjects WHERE name = '国語1A'), (SELECT id FROM users WHERE name = '国語太郎'), 'tuesday', 1, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '数学1B'), (SELECT id FROM users WHERE name = '数学太郎'), 'tuesday', 2, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '地学生物'), (SELECT id FROM users WHERE name = '化学太郎'), 'tuesday', 3, '1-4HR');

-- 水曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(4, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'wednesday', 1, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'wednesday', 2, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '地理'), (SELECT id FROM users WHERE name = '地理太郎'), 'wednesday', 3, '1-4HR');

-- 木曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(4, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 1, '共用教室（大）'),
(4, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 2, '共用教室（大）'),
(4, (SELECT id FROM subjects WHERE name = '体育1'), (SELECT id FROM users WHERE name = '体育太郎'), 'thursday', 3, '体育館');

-- 金曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(4, (SELECT id FROM subjects WHERE name = '情報'), (SELECT id FROM users WHERE name = '情報太郎'), 'friday', 1, 'コンピュータ室'),
(4, (SELECT id FROM subjects WHERE name = '英語1B'), (SELECT id FROM users WHERE name = '英語太郎'), 'friday', 2, '1-4HR'),
(4, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'friday', 3, '1-4HR');

-- 1-5クラスの時間割
-- 月曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(5, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'monday', 1, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'monday', 2, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '情報'), (SELECT id FROM users WHERE name = '情報太郎'), 'monday', 3, 'コンピュータ室');

-- 火曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(5, (SELECT id FROM subjects WHERE name = '体育1'), (SELECT id FROM users WHERE name = '体育太郎'), 'tuesday', 1, '体育館'),
(5, (SELECT id FROM subjects WHERE name = '地学生物'), (SELECT id FROM users WHERE name = '化学太郎'), 'tuesday', 2, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '数学1B'), (SELECT id FROM users WHERE name = '数学太郎'), 'tuesday', 3, '1-5HR');

-- 水曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(5, (SELECT id FROM subjects WHERE name = '英語1A'), (SELECT id FROM users WHERE name = '英語太郎'), 'wednesday', 1, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '国語1B'), (SELECT id FROM users WHERE name = '国語太郎'), 'wednesday', 2, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '化学1'), (SELECT id FROM users WHERE name = '化学太郎'), 'wednesday', 3, '1-5HR');

-- 木曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(5, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 1, '共用教室（大）'),
(5, (SELECT id FROM subjects WHERE name = '総合1'), (SELECT id FROM users WHERE name = '国語太郎'), 'thursday', 2, '共用教室（大）'),
(5, (SELECT id FROM subjects WHERE name = '地理'), (SELECT id FROM users WHERE name = '地理太郎'), 'thursday', 3, '1-5HR');

-- 金曜日
INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room) VALUES
(5, (SELECT id FROM subjects WHERE name = '英語1B'), (SELECT id FROM users WHERE name = '英語太郎'), 'friday', 1, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '国語1A'), (SELECT id FROM users WHERE name = '国語太郎'), 'friday', 2, '1-5HR'),
(5, (SELECT id FROM subjects WHERE name = '数学1A'), (SELECT id FROM users WHERE name = '数学太郎'), 'friday', 3, '1-5HR');

-- データ確認用のコメント
-- 投入されたデータの確認クエリ:
-- SELECT COUNT(*) FROM subjects; -- 12件
-- SELECT COUNT(*) FROM users WHERE role = 'teacher'; -- 8件
-- SELECT COUNT(*) FROM timetables; -- 75件（5クラス × 15コマ）
-- SELECT c.class_name, s.name, u.name, t.day_of_week, t.period, t.room 
-- FROM timetables t 
-- JOIN classes c ON t.class_id = c.id 
-- JOIN subjects s ON t.subject_id = s.id 
-- JOIN users u ON t.teacher_id = u.id 
-- WHERE c.id = 1 
-- ORDER BY t.day_of_week, t.period;
