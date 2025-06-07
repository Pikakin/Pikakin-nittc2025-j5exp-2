package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase() (*Database, error) {
	// データベース接続
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		GetEnv("DB_USER", "root"),
		GetEnv("DB_PASSWORD", "password"),
		GetEnv("DB_HOST", "mariadb"),
		GetEnv("DB_PORT", "3306"),
		GetEnv("DB_NAME", "timetable_system"),
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	database := &Database{DB: db}

	// マイグレーション実行を無効化
	// if err := database.RunMigrations(); err != nil {
	//     return nil, fmt.Errorf("failed to run migrations: %v", err)
	// }

	log.Println("Database connected successfully (migrations disabled)")
	return database, nil
}

// マイグレーション関連の関数は残しておく（将来使用する可能性があるため）
/*
func (d *Database) RunMigrations() error {
	log.Println("Starting database migrations...")
	
	// 修正: 絶対パスまたは適切な相対パスを使用
	migrationsDir := "./migrations"
	
	// ディレクトリの存在確認
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// 代替パスを試行
		migrationsDir = "/app/migrations"
		if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
			return fmt.Errorf("migrations directory not found: %v", err)
		}
	}
	
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %v", err)
	}

	// SQLファイルのみをフィルタリング
	var sqlFiles []os.DirEntry
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			sqlFiles = append(sqlFiles, file)
		}
	}

	// ファイル名でソート
	sort.Slice(sqlFiles, func(i, j int) bool {
		return sqlFiles[i].Name() < sqlFiles[j].Name()
	})

	// 各マイグレーションファイルを実行
	for _, file := range sqlFiles {
		filePath := filepath.Join(migrationsDir, file.Name())
		
		log.Printf("Executing migration: %s", file.Name())
		
		content, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %v", file.Name(), err)
		}

		// SQLを実行
		if _, err := d.DB.Exec(string(content)); err != nil {
			return fmt.Errorf("failed to execute migration %s: %v", file.Name(), err)
		}
		
		log.Printf("Migration %s executed successfully!", file.Name())
	}

	log.Println("Database migrations completed successfully!")
	return nil
}
*/

func (d *Database) Close() error {
	return d.DB.Close()
}
