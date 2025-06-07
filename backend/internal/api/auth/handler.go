package auth

import (
	"net/http"

	"kosen-schedule-system/internal/models"
	"kosen-schedule-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	authService *services.AuthService
}

func NewHandler(authService *services.AuthService) *Handler {
	return &Handler{
		authService: authService,
	}
}

// ログイン
func (h *Handler) Login(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// バリデーション
	if req.Email == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Email and password are required",
		})
	}

	// ユーザー認証
	user, err := h.authService.Authenticate(req.Email, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"message": "Invalid email or password",
		})
	}

	// JWTトークン生成
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Failed to generate token",
		})
	}

	// リフレッシュトークン生成
	refreshToken, err := h.authService.GenerateRefreshToken(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Failed to generate refresh token",
		})
	}

	response := models.LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         *user,
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Login successful",
		"data":    response,
	})
}

// 現在のユーザー情報取得
func (h *Handler) GetMe(c echo.Context) error {
	userID := c.Get("user_id").(int)
	
	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "User not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    user,
	})
}

// パスワード変更
func (h *Handler) ChangePassword(c echo.Context) error {
	userID := c.Get("user_id").(int)
	
	var req models.ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// バリデーション
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Current password and new password are required",
		})
	}

	if len(req.NewPassword) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "New password must be at least 6 characters",
		})
	}

	err := h.authService.ChangePassword(userID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Password changed successfully",
	})
}

// ログアウト（トークンの無効化は実装しないが、フロントエンドでトークンを削除）
func (h *Handler) Logout(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Logout successful",
	})
}

// ユーザー作成（管理者のみ）
func (h *Handler) CreateUser(c echo.Context) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// バリデーション
	if req.Email == "" || req.Password == "" || req.Name == "" || req.Role == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "All fields are required",
		})
	}

	user, err := h.authService.CreateUser(req.Email, req.Password, req.Name, req.Role)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"message": "User created successfully",
		"data":    user,
	})
}

// リフレッシュトークン
func (h *Handler) RefreshToken(c echo.Context) error {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// リフレッシュトークンの検証
	claims, err := h.authService.ValidateToken(req.RefreshToken)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"message": "Invalid refresh token",
		})
	}

	// ユーザー情報の取得
	user, err := h.authService.GetUserByID(claims.UserID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "User not found",
		})
	}

	// 新しいトークンの生成
	newToken, err := h.authService.GenerateToken(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Failed to generate new token",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]string{
			"token": newToken,
		},
	})
}
