package subject

import (
	"net/http"
	"strconv"

	"kosen-schedule-system/internal/models"
	"kosen-schedule-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	subjectService *services.SubjectService
}

func NewHandler(subjectService *services.SubjectService) *Handler {
	return &Handler{
		subjectService: subjectService,
	}
}

// 科目一覧取得
func (h *Handler) GetSubjects(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	if offset < 0 {
		offset = 0
	}

	category := c.QueryParam("category")
	term := c.QueryParam("term")

	subjects, total, err := h.subjectService.GetSubjects(limit, offset, category, term)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "科目一覧の取得に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"subjects": subjects,
			"total":    total,
			"limit":    limit,
			"offset":   offset,
		},
		"message": "科目一覧を取得しました",
	})
}

// 科目取得
func (h *Handler) GetSubject(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	subject, err := h.subjectService.GetSubjectByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "科目が見つかりません",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    subject,
		"message": "科目を取得しました",
	})
}

// 科目作成
func (h *Handler) CreateSubject(c echo.Context) error {
	var req models.CreateSubjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	subject, err := h.subjectService.CreateSubject(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "科目の作成に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    subject,
		"message": "科目を作成しました",
	})
}

// 科目更新
func (h *Handler) UpdateSubject(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	var req models.UpdateSubjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	subject, err := h.subjectService.UpdateSubject(id, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "科目の更新に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    subject,
		"message": "科目を更新しました",
	})
}

// 科目削除
func (h *Handler) DeleteSubject(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	err = h.subjectService.DeleteSubject(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "科目の削除に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "科目を削除しました",
	})
}
