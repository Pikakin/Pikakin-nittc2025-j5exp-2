-- データベースの使用
USE timetable_system;

-- 科目テーブル
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('一般', '専門', '実験', '実習') NOT NULL,
    term ENUM('前期', '後期', '通年') NOT NULL,
    credits INT NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_term (term)
);

-- クラステーブル
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade INT NOT NULL CHECK (grade BETWEEN 1 AND 5),
    class_name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_grade_class (grade, class_name),
    INDEX idx_grade (grade)
);

-- 時間割テーブル
CREATE TABLE IF NOT EXISTS timetables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day ENUM('月', '火', '水', '木', '金') NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 4),
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_day_period (class_id, day, period),
    INDEX idx_class_id (class_id),
    INDEX idx_subject_id (subject_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_day_period (day, period)
);

-- 変更申請テーブル
CREATE TABLE IF NOT EXISTS change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'canceled') NOT NULL DEFAULT 'pending',
    request_data JSON NOT NULL,
    approver_id INT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 初期データの挿入

-- クラスデータ
INSERT IGNORE INTO classes (grade, class_name) VALUES
(1, '1'), (1, '2'), (1, '3'), (1, '4'), (1, '5'),
(2, '1'), (2, '2'), (2, '3'), (2, '4'), (2, '5'),
(3, '1'), (3, '2'), (3, '3'), (3, '4'), (3, '5'),
(4, '1'), (4, '2'), (4, '3'), (4, '4'), (4, '5'),
(5, '1'), (5, '2'), (5, '3'), (5, '4'), (5, '5');

-- 科目データ
INSERT IGNORE INTO subjects (code, name, category, term, credits, description) VALUES
('110001', '英語1A', '一般', '前期', 2, '基礎英語'),
('110002', '数学1', '一般', '通年', 4, '基礎数学'),
('150014', 'コンピュータ概論', '専門', '前期', 2, 'コンピュータの基礎'),
('110011', '国語総合(現代文)', '一般', '通年', 4, '現代文の読解'),
('120001', '物理1', '一般', '通年', 3, '基礎物理学'),
('130001', '化学1', '一般', '前期', 2, '基礎化学'),
('140001', '地理', '一般', '前期', 2, '世界地理'),
('110003', '英語1B', '一般', '後期', 2, '英語応用'),
('150015', 'プログラミング基礎', '専門', '後期', 2, 'プログラミング入門');

-- サンプル時間割データ（1年1組のみ）
INSERT IGNORE INTO timetables (class_id, subject_id, teacher_id, day, period, room) VALUES
(1, 1, 2, '月', 1, '1-1HR'),    -- 英語1A
(1, 2, 2, '月', 2, '数学室'),    -- 数学1
(1, 3, 2, '月', 3, 'PC室'),     -- コンピュータ概論
(1, 4, 2, '火', 1, '1-1HR'),    -- 国語総合
(1, 5, 2, '火', 2, '物理室'),    -- 物理1
(1, 6, 2, '火', 3, '化学室'),    -- 化学1
(1, 7, 2, '水', 1, '1-1HR'),    -- 地理
(1, 8, 2, '水', 2, '1-1HR'),    -- 英語1B
(1, 9, 2, '木', 1, 'PC室');     -- プログラミング基礎