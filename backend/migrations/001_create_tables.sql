-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- クラステーブル
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade INT NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class (grade, class_name)
);

-- 科目テーブル
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    term ENUM('first', 'second', 'full') NOT NULL,
    credits INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 時間割テーブル
CREATE TABLE IF NOT EXISTS timetables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday') NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 4),
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule (class_id, day_of_week, period)
);

-- 変更申請テーブル
CREATE TABLE IF NOT EXISTS change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    original_timetable_id INT,
    requested_class_id INT NOT NULL,
    requested_subject_id INT NOT NULL,
    requested_teacher_id INT NOT NULL,
    requested_day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday') NOT NULL,
    requested_period INT NOT NULL CHECK (requested_period BETWEEN 1 AND 4),
    requested_room VARCHAR(50),
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (original_timetable_id) REFERENCES timetables(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX idx_timetables_class_day_period ON timetables(class_id, day_of_week, period);
CREATE INDEX idx_timetables_teacher_day_period ON timetables(teacher_id, day_of_week, period);
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_change_requests_requester ON change_requests(requester_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- 初期データの挿入（パスワードハッシュを正しく生成）
-- パスワード: "password123" のハッシュ
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理者', 'admin'),
('teacher1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '教員1', 'teacher'),
('teacher2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '教員2', 'teacher'),
('student1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '学生1', 'student');

-- クラスの初期データ
INSERT INTO classes (grade, class_name) VALUES
(1, '1'), (1, '2'), (1, '3'), (1, '4'), (1, '5'),
(2, '1'), (2, '2'), (2, '3'), (2, '4'), (2, '5'),
(3, '1'), (3, '2'), (3, '3'), (3, '4'), (3, '5'),
(4, '1'), (4, '2'), (4, '3'), (4, '4'), (4, '5'),
(5, '1'), (5, '2'), (5, '3'), (5, '4'), (5, '5');

-- 科目の初期データ
INSERT INTO subjects (code, name, term, credits) VALUES
('110001', '英語1A', 'first', 2),
('110002', '数学1', 'full', 4),
('150014', 'コンピュータ概論', 'first', 2),
('110011', '国語総合(現代)', 'full', 3);
