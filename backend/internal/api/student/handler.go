package student

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

func (h *Handler) GetStudentTimetable(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Student timetable endpoint - to be implemented",
	})
}

func RegisterRoutes(g *echo.Group, h *Handler) {
	student := g.Group("/student")
	student.GET("/timetable", h.GetStudentTimetable)
}