package request

import (
	"net/http"
	"strconv"

	"timetable-change-system/internal/models"
	"timetable-change-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	changeRequestService *services.ChangeRequestService
}

func NewHandler(changeRequestService *services.ChangeRequestService) *Handler {
	return &Handler{
		changeRequestService: changeRequestService,
	}
}

// 申請一覧取得
func (h *Handler) GetChangeRequests(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	if offset < 0 {
		offset = 0
	}

	requesterID, _ := strconv.Atoi(c.QueryParam("requester_id"))
	status := c.QueryParam("status")

	requests, total, err := h.changeRequestService.GetChangeRequests(requesterID, status, limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請一覧の取得に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"requests": requests,
			"total":    total,
			"limit":    limit,
			"offset":   offset,
		},
		"message": "申請一覧を取得しました",
	})
}

// 申請取得
func (h *Handler) GetChangeRequest(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	request, err := h.changeRequestService.GetChangeRequestByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "申請が見つかりません",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    request,
		"message": "申請を取得しました",
	})
}

// 申請作成
func (h *Handler) CreateChangeRequest(c echo.Context) error {
	// JWTからユーザーIDを取得（ミドルウェアで設定される想定）
	userID := c.Get("user_id").(int)

	var req models.CreateChangeRequestRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	request, err := h.changeRequestService.CreateChangeRequest(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請の作成に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    request,
		"message": "申請を作成しました",
	})
}

// 申請更新
func (h *Handler) UpdateChangeRequest(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	var req models.UpdateChangeRequestRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	request, err := h.changeRequestService.UpdateChangeRequest(id, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請の更新に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    request,
		"message": "申請を更新しました",
	})
}

// 申請承認
func (h *Handler) ApproveChangeRequest(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	// JWTからユーザーIDを取得
	approverID := c.Get("user_id").(int)

	var req struct {
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	request, err := h.changeRequestService.ApproveChangeRequest(id, approverID, req.Comment)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請の承認に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    request,
		"message": "申請を承認しました",
	})
}

// 申請却下
func (h *Handler) RejectChangeRequest(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	// JWTからユーザーIDを取得
	approverID := c.Get("user_id").(int)

	var req struct {
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "リクエストデータが無効です",
		})
	}

	request, err := h.changeRequestService.RejectChangeRequest(id, approverID, req.Comment)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請の却下に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    request,
		"message": "申請を却下しました",
	})
}

// 申請削除
func (h *Handler) DeleteChangeRequest(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "無効なIDです",
		})
	}

	err = h.changeRequestService.DeleteChangeRequest(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "申請の削除に失敗しました",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "申請を削除しました",
	})
}
