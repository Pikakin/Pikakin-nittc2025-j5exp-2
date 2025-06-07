package main

import (
	"database/sql"
	"log"

	"timetable-change-system/internal/config"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()
	
	db, err := sql.Open("mysql", cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// パスワードのハッシュ化
	password := "password123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	users := []struct {
		email string
		name  string
		role  string
	}{
		{"admin@example.com", "管理者", "admin"},
		{"teacher1@example.com", "教員1", "teacher"},
		{"teacher2@example.com", "教員2", "teacher"},
		{"student1@example.com", "学生1", "student"},
	}

	for _, user := range users {
		// ユーザーが存在するかチェック
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", user.email).Scan(&count)
		if err != nil {
			log.Printf("Error checking user %s: %v", user.email, err)
			continue
		}

		if count > 0 {
			// 既存ユーザーのパスワードハッシュを更新
			_, err = db.Exec("UPDATE users SET password_hash = ? WHERE email = ?", string(hash), user.email)
			if err != nil {
				log.Printf("Error updating user %s: %v", user.email, err)
			} else {
				log.Printf("Updated password for user: %s", user.email)
			}
		} else {
			// 新規ユーザーを作成
			_, err = db.Exec("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
				user.email, string(hash), user.name, user.role)
			if err != nil {
				log.Printf("Error creating user %s: %v", user.email, err)
			} else {
				log.Printf("Created user: %s", user.email)
			}
		}
	}

	log.Println("User initialization completed")
}