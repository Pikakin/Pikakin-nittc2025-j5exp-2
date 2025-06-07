package services

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"kosen-schedule-system/internal/models"
)

type CSVService struct {
	db *sql.DB
}

func NewCSVService(db *sql.DB) *CSVService {
	return &CSVService{db: db}
}

// 担当者CSVインポート
func (s *CSVService) ImportSubjects(reader io.Reader) (*models.CSVImportResult, error) {
	csvReader := csv.NewReader(reader)
	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("CSV読み込みエラー: %v", err)
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSVファイルが空または不正です")
	}

	result := &models.CSVImportResult{
		Success:       true,
		TotalRows:     len(records) - 1, // ヘッダー行を除く
		ProcessedRows: 0,
		ErrorRows:     []models.CSVErrorRow{},
		Errors:        []string{},
		ProcessedAt:   time.Now(),
	}

	// ヘッダー行をスキップ
	for i, record := range records[1:] {
		rowNum := i + 2 // 実際の行番号（ヘッダー含む）

		if len(record) < 8 {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: "列数が不足しています",
				Data:  strings.Join(record, ","),
			})
			continue
		}

		subjectCSV := models.SubjectCSV{
			SubjectCode: strings.TrimSpace(record[0]),
			Class:       strings.TrimSpace(record[1]),
			Room:        strings.TrimSpace(record[2]),
			SubjectName: strings.TrimSpace(record[3]),
			WorkType:    strings.TrimSpace(record[4]),
			Teacher1:    strings.TrimSpace(record[5]),
			Teacher2:    strings.TrimSpace(record[6]),
			Teacher3:    strings.TrimSpace(record[7]),
		}

		// バリデーション
		if err := s.validateSubjectCSV(subjectCSV); err != nil {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: err.Error(),
				Data:  strings.Join(record, ","),
			})
			continue
		}

		// データベースに保存
		if err := s.saveSubjectFromCSV(subjectCSV); err != nil {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: fmt.Sprintf("保存エラー: %v", err),
				Data:  strings.Join(record, ","),
			})
			continue
		}

		result.ProcessedRows++
	}

	// エラーがある場合は部分的成功
	if len(result.ErrorRows) > 0 {
		result.Success = false
		result.Errors = append(result.Errors, fmt.Sprintf("%d行でエラーが発生しました", len(result.ErrorRows)))
	}

	return result, nil
}

// 時間割CSVインポート
func (s *CSVService) ImportTimetables(reader io.Reader) (*models.CSVImportResult, error) {
	csvReader := csv.NewReader(reader)
	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("CSV読み込みエラー: %v", err)
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSVファイルが空または不正です")
	}

	result := &models.CSVImportResult{
		Success:       true,
		TotalRows:     len(records) - 1,
		ProcessedRows: 0,
		ErrorRows:     []models.CSVErrorRow{},
		Errors:        []string{},
		ProcessedAt:   time.Now(),
	}

	// ヘッダー行をスキップ
	for i, record := range records[1:] {
		rowNum := i + 2

		if len(record) < 21 {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: "列数が不足しています（21列必要）",
				Data:  strings.Join(record, ","),
			})
			continue
		}

		timetableCSV := models.TimetableCSV{
			Class: strings.TrimSpace(record[0]),
			Mon1:  strings.TrimSpace(record[1]),
			Mon2:  strings.TrimSpace(record[2]),
			Mon3:  strings.TrimSpace(record[3]),
			Mon4:  strings.TrimSpace(record[4]),
			Tue1:  strings.TrimSpace(record[5]),
			Tue2:  strings.TrimSpace(record[6]),
			Tue3:  strings.TrimSpace(record[7]),
			Tue4:  strings.TrimSpace(record[8]),
			Wed1:  strings.TrimSpace(record[9]),
			Wed2:  strings.TrimSpace(record[10]),
			Wed3:  strings.TrimSpace(record[11]),
			Wed4:  strings.TrimSpace(record[12]),
			Thu1:  strings.TrimSpace(record[13]),
			Thu2:  strings.TrimSpace(record[14]),
			Thu3:  strings.TrimSpace(record[15]),
			Thu4:  strings.TrimSpace(record[16]),
			Fri1:  strings.TrimSpace(record[17]),
			Fri2:  strings.TrimSpace(record[18]),
			Fri3:  strings.TrimSpace(record[19]),
			Fri4:  strings.TrimSpace(record[20]),
		}

		// バリデーション
		if err := s.validateTimetableCSV(timetableCSV); err != nil {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: err.Error(),
				Data:  strings.Join(record, ","),
			})
			continue
		}

		// データベースに保存
		if err := s.saveTimetableFromCSV(timetableCSV); err != nil {
			result.ErrorRows = append(result.ErrorRows, models.CSVErrorRow{
				Row:   rowNum,
				Error: fmt.Sprintf("保存エラー: %v", err),
				Data:  strings.Join(record, ","),
			})
			continue
		}

		result.ProcessedRows++
	}

	if len(result.ErrorRows) > 0 {
		result.Success = false
		result.Errors = append(result.Errors, fmt.Sprintf("%d行でエラーが発生しました", len(result.ErrorRows)))
	}

	return result, nil
}

// 担当者CSVバリデーション
func (s *CSVService) validateSubjectCSV(data models.SubjectCSV) error {
	if data.SubjectCode == "" {
		return fmt.Errorf("科目コードが必須です")
	}
	if data.Class == "" {
		return fmt.Errorf("クラスが必須です")
	}
	if data.SubjectName == "" {
		return fmt.Errorf("科目名が必須です")
	}
	if data.Teacher1 == "" {
		return fmt.Errorf("教員１が必須です")
	}
	return nil
}

// 時間割CSVバリデーション
func (s *CSVService) validateTimetableCSV(data models.TimetableCSV) error {
	if data.Class == "" {
		return fmt.Errorf("クラスが必須です")
	}
	
	// クラス形式チェック（例: 1-1, 2-3など）
	parts := strings.Split(data.Class, "-")
	if len(parts) != 2 {
		return fmt.Errorf("クラス形式が不正です（例: 1-1）")
	}
	
	grade, err := strconv.Atoi(parts[0])
	if err != nil || grade < 1 || grade > 5 {
		return fmt.Errorf("学年は1-5の範囲で指定してください")
	}
	
	return nil
}

// 担当者データ保存
func (s *CSVService) saveSubjectFromCSV(data models.SubjectCSV) error {
	// トランザクション開始
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 科目データ保存
	subjectQuery := `
		INSERT INTO subjects (code, name, term, credits) 
		VALUES (?, ?, '前期', 1)
		ON DUPLICATE KEY UPDATE name = VALUES(name)
	`
	_, err = tx.Exec(subjectQuery, data.SubjectCode, data.SubjectName)
	if err != nil {
		return fmt.Errorf("科目保存エラー: %v", err)
	}

	// クラスデータ保存
	classParts := strings.Split(data.Class, "-")
	if len(classParts) == 2 {
		grade, _ := strconv.Atoi(classParts[0])
		className := classParts[1]
		
		classQuery := `
			INSERT INTO classes (grade, class_name) 
			VALUES (?, ?)
			ON DUPLICATE KEY UPDATE class_name = VALUES(class_name)
		`
		_, err = tx.Exec(classQuery, grade, className)
		if err != nil {
			return fmt.Errorf("クラス保存エラー: %v", err)
		}
	}

	return tx.Commit()
}

// CSVエクスポート（続き）
func (s *CSVService) ExportTimetables(writer io.Writer, filter map[string]interface{}) error {
	csvWriter := csv.NewWriter(writer)
	defer csvWriter.Flush()

	// ヘッダー書き込み
	header := []string{"クラス", "月１", "月２", "月３", "月４", "火１", "火２", "火３", "火４", 
		"水１", "水２", "水３", "水４", "木１", "木２", "木３", "木４", "金１", "金２", "金３", "金４"}
	
	if err := csvWriter.Write(header); err != nil {
		return fmt.Errorf("ヘッダー書き込みエラー: %v", err)
	}

	// クラス一覧取得
	classes, err := s.getClassesForExport(filter)
	if err != nil {
		return fmt.Errorf("クラス取得エラー: %v", err)
	}

	// 各クラスの時間割データを取得・書き込み
	for _, class := range classes {
		timetableData, err := s.getTimetableDataForClass(class.ID)
		if err != nil {
			return fmt.Errorf("時間割取得エラー (クラス%s): %v", class.ClassName, err)
		}

		record := []string{
			fmt.Sprintf("%d-%s", class.Grade, class.ClassName),
			timetableData["monday"][1], timetableData["monday"][2], timetableData["monday"][3], timetableData["monday"][4],
			timetableData["tuesday"][1], timetableData["tuesday"][2], timetableData["tuesday"][3], timetableData["tuesday"][4],
			timetableData["wednesday"][1], timetableData["wednesday"][2], timetableData["wednesday"][3], timetableData["wednesday"][4],
			timetableData["thursday"][1], timetableData["thursday"][2], timetableData["thursday"][3], timetableData["thursday"][4],
			timetableData["friday"][1], timetableData["friday"][2], timetableData["friday"][3], timetableData["friday"][4],
		}

		if err := csvWriter.Write(record); err != nil {
			return fmt.Errorf("データ書き込みエラー: %v", err)
		}
	}

	return nil
}

// 時間割データ保存（完成版）
func (s *CSVService) saveTimetableFromCSV(data models.TimetableCSV) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// クラス情報取得
	classParts := strings.Split(data.Class, "-")
	grade, _ := strconv.Atoi(classParts[0])
	className := classParts[1]

	var classID int
	err = tx.QueryRow("SELECT id FROM classes WHERE grade = ? AND class_name = ?", grade, className).Scan(&classID)
	if err != nil {
		return fmt.Errorf("クラスが見つかりません: %s", data.Class)
	}

	// 既存の時間割データを削除
	_, err = tx.Exec("DELETE FROM timetables WHERE class_id = ?", classID)
	if err != nil {
		return fmt.Errorf("既存データ削除エラー: %v", err)
	}

	// 時間割データマップ
	timetableMap := map[string]map[int]string{
		"monday":    {1: data.Mon1, 2: data.Mon2, 3: data.Mon3, 4: data.Mon4},
		"tuesday":   {1: data.Tue1, 2: data.Tue2, 3: data.Tue3, 4: data.Tue4},
		"wednesday": {1: data.Wed1, 2: data.Wed2, 3: data.Wed3, 4: data.Wed4},
		"thursday":  {1: data.Thu1, 2: data.Thu2, 3: data.Thu3, 4: data.Thu4},
		"friday":    {1: data.Fri1, 2: data.Fri2, 3: data.Fri3, 4: data.Fri4},
	}

	// 各時間割データを保存
	for day, periods := range timetableMap {
		for period, subjectName := range periods {
			if subjectName == "" || subjectName == "空" {
				continue
			}

			// 科目ID取得（存在しない場合は作成）
			subjectID, err := s.getOrCreateSubjectID(tx, subjectName)
			if err != nil {
				return fmt.Errorf("科目処理エラー: %v", err)
			}

			// 教員ID取得（デフォルト教員を使用）
			teacherID := 1 // デフォルト教員ID

			// 時間割データ挿入
			insertQuery := `
				INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, period, room, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
			`
			_, err = tx.Exec(insertQuery, classID, subjectID, teacherID, day, period, "未定")
			if err != nil {
				return fmt.Errorf("時間割挿入エラー: %v", err)
			}
		}
	}

	return tx.Commit()
}

// 科目ID取得または作成
func (s *CSVService) getOrCreateSubjectID(tx *sql.Tx, subjectName string) (int, error) {
	var subjectID int
	err := tx.QueryRow("SELECT id FROM subjects WHERE name = ?", subjectName).Scan(&subjectID)
	if err == sql.ErrNoRows {
		// 科目が存在しない場合は作成
		result, err := tx.Exec("INSERT INTO subjects (code, name, term, credits, created_at, updated_at) VALUES (?, ?, '前期', 1, NOW(), NOW())", 
			fmt.Sprintf("AUTO_%d", time.Now().Unix()), subjectName)
		if err != nil {
			return 0, err
		}
		id, err := result.LastInsertId()
		if err != nil {
			return 0, err
		}
		return int(id), nil
	} else if err != nil {
		return 0, err
	}
	return subjectID, nil
}

// エクスポート用クラス取得
func (s *CSVService) getClassesForExport(filter map[string]interface{}) ([]struct {
	ID        int
	Grade     int
	ClassName string
}, error) {
	query := "SELECT id, grade, class_name FROM classes"
	var args []interface{}

	// フィルター条件追加
	if grade, ok := filter["grade"]; ok {
		query += " WHERE grade = ?"
		args = append(args, grade)
	}

	query += " ORDER BY grade, class_name"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []struct {
		ID        int
		Grade     int
		ClassName string
	}

	for rows.Next() {
		var class struct {
			ID        int
			Grade     int
			ClassName string
		}
		if err := rows.Scan(&class.ID, &class.Grade, &class.ClassName); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}

	return classes, nil
}

// クラス別時間割データ取得
func (s *CSVService) getTimetableDataForClass(classID int) (map[string]map[int]string, error) {
	query := `
		SELECT t.day_of_week, t.period, s.name
		FROM timetables t
		JOIN subjects s ON t.subject_id = s.id
		WHERE t.class_id = ?
		ORDER BY t.day_of_week, t.period
	`

	rows, err := s.db.Query(query, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 初期化
	timetableData := map[string]map[int]string{
		"monday":    {1: "", 2: "", 3: "", 4: ""},
		"tuesday":   {1: "", 2: "", 3: "", 4: ""},
		"wednesday": {1: "", 2: "", 3: "", 4: ""},
		"thursday":  {1: "", 2: "", 3: "", 4: ""},
		"friday":    {1: "", 2: "", 3: "", 4: ""},
	}

	for rows.Next() {
		var day string
		var period int
		var subjectName string

		if err := rows.Scan(&day, &period, &subjectName); err != nil {
			return nil, err
		}

		if periods, ok := timetableData[day]; ok {
			periods[period] = subjectName
		}
	}

	return timetableData, nil
}

// 担当者CSVエクスポート
func (s *CSVService) ExportSubjects(writer io.Writer, filter map[string]interface{}) error {
	csvWriter := csv.NewWriter(writer)
	defer csvWriter.Flush()

	// ヘッダー書き込み
	header := []string{"科目コード", "クラス", "実施場所", "科目", "勤務形態", "教員１", "教員２", "教員３"}
	if err := csvWriter.Write(header); err != nil {
		return fmt.Errorf("ヘッダー書き込みエラー: %v", err)
	}

	// データ取得・書き込み
	query := `
		SELECT s.code, CONCAT(c.grade, '-', c.class_name), t.room, s.name, '常勤', u.name, '', ''
		FROM subjects s
		JOIN timetables t ON s.id = t.subject_id
		JOIN classes c ON t.class_id = c.id
		JOIN users u ON t.teacher_id = u.id
		GROUP BY s.id, c.id
		ORDER BY c.grade, c.class_name, s.code
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return fmt.Errorf("データ取得エラー: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var record []string = make([]string, 8)
		if err := rows.Scan(&record[0], &record[1], &record[2], &record[3], &record[4], &record[5], &record[6], &record[7]); err != nil {
			return fmt.Errorf("データ読み込みエラー: %v", err)
		}

		if err := csvWriter.Write(record); err != nil {
			return fmt.Errorf("データ書き込みエラー: %v", err)
		}
	}

	return nil
}
