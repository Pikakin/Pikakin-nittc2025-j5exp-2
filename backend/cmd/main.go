package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"timetable-change-system/internal/models"
)

func main() {
	// Echoインスタンス作成
	e := echo.New()

	// ミドルウェア設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ヘルスチェックエンドポイント
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Kosen Schedule System API",
			"status":  "running",
		})
	})

	// API グループ
	api := e.Group("/api")

	// 認証エンドポイント
	auth := api.Group("/auth")
	auth.POST("/login", handleLogin)
	auth.GET("/me", handleMe)

	// サーバー起動
	log.Println("Server starting on port 8080...")
	e.Logger.Fatal(e.Start(":8080"))
}

// 修正されたログイン処理
func handleLogin(c echo.Context) error {
	log.Println("=== Login request received ===")
	
	// リクエストボディを直接読み取り
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		return c.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Message: "Failed to read request body",
		})
	}
	
	log.Printf("Raw request body: %s", string(body))
	
	// JSONをパース
	var req models.LoginRequest
	
	if err := json.Unmarshal(body, &req); err != nil {
		log.Printf("JSON unmarshal error: %v", err)
		return c.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Message: "Invalid JSON format",
		})
	}

	// 受信したデータをログ出力
	log.Printf("Parsed data - Email: '%s', Password: '%s'", req.Email, req.Password)
	log.Printf("Email length: %d, Password length: %d", len(req.Email), len(req.Password))

	// 仮の認証チェック
	if req.Email == "admin@test.com" && req.Password == "password" {
		log.Printf("✅ Login successful for: %s", req.Email)
		
		user := models.User{
			ID:        1,
			Name:      "管理者",
			Email:     req.Email,
			Role:      "admin",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		
		loginResponse := models.LoginResponse{
			Token:        "mock-jwt-token-12345",
			RefreshToken: "mock-refresh-token-67890",
			User:         user,
		}
		
		return c.JSON(http.StatusOK, models.AuthResponse{
			Success: true,
			Data:    loginResponse,
			Message: "ログインに成功しました",
		})
	}

	// 他の認証パターンも追加
	validUsers := map[string]map[string]interface{}{
		"teacher@test.com": {
			"password": "password",
			"name":     "教員",
			"role":     "teacher",
		},
		"student@test.com": {
			"password": "password", 
			"name":     "学生",
			"role":     "student",
		},
	}

	if userData, exists := validUsers[req.Email]; exists {
		if userData["password"] == req.Password {
			log.Printf("✅ Login successful for: %s", req.Email)
			
			user := models.User{
				ID:        1,
				Name:      userData["name"].(string),
				Email:     req.Email,
				Role:      userData["role"].(string),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			
			loginResponse := models.LoginResponse{
				Token:        "mock-jwt-token-12345",
				RefreshToken: "mock-refresh-token-67890",
				User:         user,
			}
			
			return c.JSON(http.StatusOK, models.AuthResponse{
				Success: true,
				Data:    loginResponse,
				Message: "ログインに成功しました",
			})
		}
	}

	// 認証失敗の詳細ログ
	log.Printf("❌ Login failed for email: '%s' with password: '%s'", req.Email, req.Password)
	return c.JSON(http.StatusUnauthorized, models.AuthResponse{
		Success: false,
		Message: "Invalid email or password",
	})
}

// ユーザー情報取得処理
func handleMe(c echo.Context) error {
	user := models.User{
		ID:        1,
		Name:      "管理者",
		Email:     "admin@test.com",
		Role:      "admin",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	return c.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data:    user,
	})
}
