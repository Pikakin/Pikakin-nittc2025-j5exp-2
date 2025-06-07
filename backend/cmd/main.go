package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"kosen-schedule-system/internal/api/csv"
	"kosen-schedule-system/internal/api/timetable"
	"kosen-schedule-system/internal/config"
	"kosen-schedule-system/internal/models"
	"kosen-schedule-system/internal/services"

	_ "github.com/go-sql-driver/mysql"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// データベース接続
	db, err := config.NewDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// サービス初期化
	timetableService := services.NewTimetableService(db.DB)
	classService := services.NewClassService(db.DB)

	// ハンドラー初期化
	timetableHandler := timetable.NewHandler(timetableService, classService)

	// Echo初期化
	e := echo.New()

	// ミドルウェア
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ヘルスチェック
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Kosen Schedule System API",
			"status":  "running",
		})
	})

	// API グループ
	api := e.Group("/api")

	// 認証エンドポイント（既存）
	api.POST("/auth/login", handleLogin)
	api.GET("/auth/me", handleMe)

	// 時間割関連エンドポイント（新規追加）
	api.GET("/timetables", timetableHandler.GetTimetables)
	api.GET("/timetables/:id", timetableHandler.GetTimetableByID)
	api.GET("/timetables/weekly/:class_id", timetableHandler.GetWeeklyTimetable)
	
	// クラス関連エンドポイント（新規追加）
	api.GET("/classes", timetableHandler.GetClasses)
	api.GET("/classes/:id", timetableHandler.GetClassByID)

	// CSV関連のルート追加（修正版）
	csvService := services.NewCSVService(db.DB)
	csvHandler := csv.NewHandler(csvService)

	// CSV API エンドポイント（認証なしで一時的に動作確認）
	csvGroup := api.Group("/csv")
	csvGroup.POST("/import/subjects", csvHandler.ImportSubjects)
	csvGroup.POST("/import/timetables", csvHandler.ImportTimetables)
	csvGroup.GET("/export/timetables", csvHandler.ExportTimetables)
	csvGroup.GET("/export/subjects", csvHandler.ExportSubjects)

	// サーバー起動
	log.Println("Server starting on :8080...")
	e.Logger.Fatal(e.Start(":8080"))
}

// 既存の認証関数（変更なし）
func handleLogin(c echo.Context) error {
	log.Println("=== Login request received ===")
	
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		return c.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Message: "Failed to read request body",
		})
	}
	
	log.Printf("Raw request body: %s", string(body))
	
	var req models.LoginRequest
	
	if err := json.Unmarshal(body, &req); err != nil {
		log.Printf("JSON unmarshal error: %v", err)
		return c.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Message: "Invalid JSON format",
		})
	}

	log.Printf("Parsed data - Email: '%s', Password: '%s'", req.Email, req.Password)

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

	log.Printf("❌ Login failed for email: '%s'", req.Email)
	return c.JSON(http.StatusUnauthorized, models.AuthResponse{
		Success: false,
		Message: "Invalid email or password",
	})
}

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
