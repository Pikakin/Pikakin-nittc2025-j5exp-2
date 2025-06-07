package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// 管理者のみアクセス可能
func AdminOnly() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole := c.Get("user_role").(string)
			if userRole != "admin" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"message": "管理者権限が必要です",
				})
			}
			return next(c)
		}
	}
}

// 教員または管理者のみアクセス可能
func TeacherOrAdmin() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole := c.Get("user_role").(string)
			if userRole != "teacher" && userRole != "admin" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"message": "教員または管理者権限が必要です",
				})
			}
			return next(c)
		}
	}
}

// 学生のみアクセス可能
func StudentOnly() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole := c.Get("user_role").(string)
			if userRole != "student" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"message": "学生権限が必要です",
				})
			}
			return next(c)
		}
	}
}