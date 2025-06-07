package auth

import (
	"timetable-change-system/internal/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	auth := e.Group("/api/auth")
	
	// 認証不要のエンドポイント
	auth.POST("/login", handler.Login)
	auth.POST("/refresh", handler.RefreshToken)
	
	// 認証必要のエンドポイント
	auth.GET("/me", handler.GetMe, authMiddleware.RequireAuth)
	auth.POST("/logout", handler.Logout, authMiddleware.RequireAuth)
	auth.POST("/change-password", handler.ChangePassword, authMiddleware.RequireAuth)
	
	// 管理者のみ
	auth.POST("/users", handler.CreateUser, authMiddleware.RequireAdmin)
}