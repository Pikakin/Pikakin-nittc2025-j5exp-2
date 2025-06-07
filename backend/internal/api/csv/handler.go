package csv

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"kosen-schedule-system/internal/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	csvService *services.CSVService
}

func NewHandler(csvService *services.CSVService) *Handler {
	return &Handler{
		csvService: csvService,
	}
}

// 担当者CSVインポート
func (h *Handler) ImportSubjects(c echo.Context) error {
	// ファイル取得
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "ファイルが選択されていません",
		})
	}

	// ファイルサイズチェック（10MB制限）
	if file.Size > 10*1024*1024 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "ファイルサイズが大きすぎます（10MB以下にしてください）",
		})
	}

	// ファイル拡張子チェック
	if !isCSVFile(file.Filename) {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "CSVファイルを選択してください",
		})
	}

	// ファイルを開く
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ファイルの読み込みに失敗しました",
		})
	}
	defer src.Close()

	// CSVインポート実行
	result, err := h.csvService.ImportSubjects(src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("インポートに失敗しました: %v", err),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "担当者データのインポートが完了しました",
		"data":    result,
	})
}

// 時間割CSVインポート（続き）
func (h *Handler) ImportTimetables(c echo.Context) error {
	// ファイル取得
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "ファイルが選択されていません",
		})
	}

	// ファイルサイズチェック
	if file.Size > 10*1024*1024 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "ファイルサイズが大きすぎます（10MB以下にしてください）",
		})
	}

	// ファイル拡張子チェック
	if !isCSVFile(file.Filename) {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "CSVファイルを選択してください",
		})
	}

	// ファイルを開く
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ファイルの読み込みに失敗しました",
		})
	}
	defer src.Close()

	// CSVインポート実行
	result, err := h.csvService.ImportTimetables(src)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("インポートに失敗しました: %v", err),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "時間割データのインポートが完了しました",
		"data":    result,
	})
}

// 時間割CSVエクスポート
func (h *Handler) ExportTimetables(c echo.Context) error {
	// フィルターパラメータ取得
	filter := make(map[string]interface{})
	
	if grade := c.QueryParam("grade"); grade != "" {
		if g, err := strconv.Atoi(grade); err == nil {
			filter["grade"] = g
		}
	}

	// レスポンスヘッダー設定
	filename := fmt.Sprintf("timetables_%s.csv", time.Now().Format("20060102_150405"))
	c.Response().Header().Set("Content-Type", "text/csv; charset=utf-8")
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	// CSVエクスポート実行
	if err := h.csvService.ExportTimetables(c.Response().Writer, filter); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("エクスポートに失敗しました: %v", err),
		})
	}

	return nil
}

// 担当者CSVエクスポート
func (h *Handler) ExportSubjects(c echo.Context) error {
	// フィルターパラメータ取得
	filter := make(map[string]interface{})
	
	if grade := c.QueryParam("grade"); grade != "" {
		if g, err := strconv.Atoi(grade); err == nil {
			filter["grade"] = g
		}
	}

	// レスポンスヘッダー設定
	filename := fmt.Sprintf("subjects_%s.csv", time.Now().Format("20060102_150405"))
	c.Response().Header().Set("Content-Type", "text/csv; charset=utf-8")
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	// CSVエクスポート実行
	if err := h.csvService.ExportSubjects(c.Response().Writer, filter); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("エクスポートに失敗しました: %v", err),
		})
	}

	return nil
}

// CSVファイル判定
func isCSVFile(filename string) bool {
	return len(filename) > 4 && filename[len(filename)-4:] == ".csv"
}
