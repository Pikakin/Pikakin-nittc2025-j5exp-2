package admin

import (
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	db *sql.DB
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) GetAdminDashboard(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Admin dashboard endpoint - to be implemented",
	})
}

func RegisterRoutes(g *echo.Group, h *Handler) {
	admin := g.Group("/admin")
	admin.GET("/dashboard", h.GetAdminDashboard)
}