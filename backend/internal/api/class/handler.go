package class

import (
	"net/http"
	"strconv"

	"timetable-change-system/internal/models"
	"timetable-change-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	classService *services.ClassService
}

func NewHandler(classService *services.ClassService) *Handler {
	return &Handler{
		classService: classService,
	}
}

// クラス一覧取得
func (h *Handler) GetClasses(c echo.Context) error {
	grade, _ := strconv.Atoi(c.QueryParam("grade"))

	classes, err := h.classService.GetClasses(grade)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "クラス一覧の取得に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    classes,
		"message": "クラス一覧を取得しました",
	})
}

// クラス取得
func (h *Handler) GetClass(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	class, err := h.classService.GetClassByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "クラスが見つかりません",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    class,
		"message": "クラスを取得しました",
	})
}

// クラス作成
func (h *Handler) CreateClass(c echo.Context) error {
	var req models.CreateClassRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	class, err := h.classService.CreateClass(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "クラスの作成に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    class,
		"message": "クラスを作成しました",
	})
}

// クラス更新
func (h *Handler) UpdateClass(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	var req models.UpdateClassRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	class, err := h.classService.UpdateClass(id, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "クラスの更新に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    class,
		"message": "クラスを更新しました",
	})
}

// クラス削除
func (h *Handler) DeleteClass(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	err = h.classService.DeleteClass(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "クラスの削除に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "クラスを削除しました",
	})
}