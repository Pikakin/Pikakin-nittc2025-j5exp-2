package auth

import (
	"net/http"

	"kosen-schedule-system/internal/models"
	"kosen-schedule-system/internal/services"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login - ログイン処理
func (h *AuthHandler) Login(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Message: "リクエストデータが無効です",
		})
	}

	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	loginResponse := models.LoginResponse{
		Token:        token,
		RefreshToken: "", // リフレッシュトークンは後で実装
		User:         *user,
	}

	return c.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data:    loginResponse,
		Message: "ログインに成功しました",
	})
}

// GetCurrentUser - 現在のユーザー情報取得
func (h *AuthHandler) GetCurrentUser(c echo.Context) error {
	userID := c.Get("user_id").(int)
	
	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		return c.JSON(http.StatusNotFound, models.AuthResponse{
			Success: false,
			Message: "ユーザーが見つかりません",
		})
	}

	return c.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data:    user,
	})
}