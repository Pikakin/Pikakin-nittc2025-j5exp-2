package timetable

import (
	"net/http"
	"strconv"

	"timetable-change-system/internal/models"
	"timetable-change-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	timetableService *services.TimetableService
}

func NewHandler(timetableService *services.TimetableService) *Handler {
	return &Handler{
		timetableService: timetableService,
	}
}

// 時間割一覧取得（フィルタリング対応）
func (h *Handler) GetTimetables(c echo.Context) error {
	classID, _ := strconv.Atoi(c.QueryParam("class_id"))
	grade, _ := strconv.Atoi(c.QueryParam("grade"))
	day := c.QueryParam("day")

	var timetables []*models.Timetable
	var err error

	if grade > 0 {
		timetables, err = h.timetableService.GetTimetablesByGrade(grade)
	} else {
		timetables, err = h.timetableService.GetTimetables(classID, day)
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "時間割一覧の取得に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    timetables,
		"message": "時間割一覧を取得しました",
	})
}

// 週間時間割取得
func (h *Handler) GetWeeklyTimetable(c echo.Context) error {
	classID, err := strconv.Atoi(c.Param("class_id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なクラスIDです",
		})
	}

	weeklyTimetable, err := h.timetableService.GetWeeklyTimetable(classID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "週間時間割の取得に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    weeklyTimetable,
		"message": "週間時間割を取得しました",
	})
}

// 時間割取得
func (h *Handler) GetTimetable(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	timetable, err := h.timetableService.GetTimetableByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "時間割が見つかりません",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    timetable,
		"message": "時間割を取得しました",
	})
}

// 時間割作成
func (h *Handler) CreateTimetable(c echo.Context) error {
	var req models.CreateTimetableRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	timetable, err := h.timetableService.CreateTimetable(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "時間割の作成に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    timetable,
		"message": "時間割を作成しました",
	})
}

// 時間割更新
func (h *Handler) UpdateTimetable(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	var req models.UpdateTimetableRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	timetable, err := h.timetableService.UpdateTimetable(id, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "時間割の更新に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    timetable,
		"message": "時間割を更新しました",
	})
}

// 時間割削除
func (h *Handler) DeleteTimetable(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	err = h.timetableService.DeleteTimetable(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "時間割の削除に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "時間割を削除しました",
	})
}
