package timetable

import (
	"net/http"
	"strconv"

	"kosen-schedule-system/internal/models"
	"kosen-schedule-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	timetableService *services.TimetableService
	classService     *services.ClassService
}

func NewHandler(timetableService *services.TimetableService, classService *services.ClassService) *Handler {
	return &Handler{
		timetableService: timetableService,
		classService:     classService,
	}
}

// 時間割一覧取得
func (h *Handler) GetTimetables(c echo.Context) error {
	var filter models.TimetableFilter

	// クエリパラメータからフィルター条件を取得
	if gradeStr := c.QueryParam("grade"); gradeStr != "" {
		if grade, err := strconv.Atoi(gradeStr); err == nil {
			filter.Grade = &grade
		}
	}

	if classIDStr := c.QueryParam("class_id"); classIDStr != "" {
		if classID, err := strconv.Atoi(classIDStr); err == nil {
			filter.ClassID = &classID
		}
	}

	if className := c.QueryParam("class_name"); className != "" {
		filter.ClassName = &className
	}

	if dayOfWeek := c.QueryParam("day_of_week"); dayOfWeek != "" {
		filter.DayOfWeek = &dayOfWeek
	}

	if teacherIDStr := c.QueryParam("teacher_id"); teacherIDStr != "" {
		if teacherID, err := strconv.Atoi(teacherIDStr); err == nil {
			filter.TeacherID = &teacherID
		}
	}

	timetables, err := h.timetableService.GetTimetables(filter)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    timetables,
	})
}

// 週間時間割取得
func (h *Handler) GetWeeklyTimetable(c echo.Context) error {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid class_id",
		})
	}

	weekly, err := h.timetableService.GetWeeklyTimetable(classID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    weekly,
	})
}

// クラス一覧取得
func (h *Handler) GetClasses(c echo.Context) error {
	classes, err := h.classService.GetClasses()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    classes,
	})
}

// 時間割詳細取得
func (h *Handler) GetTimetableByID(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid timetable ID",
		})
	}

	// 単一の時間割を取得するためのフィルター
	filter := models.TimetableFilter{}
	timetables, err := h.timetableService.GetTimetables(filter)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
	}

	// IDで検索
	for _, timetable := range timetables {
		if timetable.ID == id {
			return c.JSON(http.StatusOK, map[string]interface{}{
				"success": true,
				"data":    timetable,
			})
		}
	}

	return c.JSON(http.StatusNotFound, map[string]interface{}{
		"success": false,
		"error":   "Timetable not found",
	})
}

// クラス詳細取得
func (h *Handler) GetClassByID(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid class ID",
		})
	}

	class, err := h.classService.GetClassByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    class,
	})
}
