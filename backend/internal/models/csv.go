package models

import "time"

// CSV担当者データ構造
type SubjectCSV struct {
	SubjectCode string `csv:"科目コード" json:"subject_code"`
	Class       string `csv:"クラス" json:"class"`
	Room        string `csv:"実施場所" json:"room"`
	SubjectName string `csv:"科目" json:"subject_name"`
	WorkType    string `csv:"勤務形態" json:"work_type"`
	Teacher1    string `csv:"教員１" json:"teacher1"`
	Teacher2    string `csv:"教員２" json:"teacher2"`
	Teacher3    string `csv:"教員３" json:"teacher3"`
}

// CSV時間割データ構造
type TimetableCSV struct {
	Class string `csv:"クラス" json:"class"`
	Mon1  string `csv:"月１" json:"mon1"`
	Mon2  string `csv:"月２" json:"mon2"`
	Mon3  string `csv:"月３" json:"mon3"`
	Mon4  string `csv:"月４" json:"mon4"`
	Tue1  string `csv:"火１" json:"tue1"`
	Tue2  string `csv:"火２" json:"tue2"`
	Tue3  string `csv:"火３" json:"tue3"`
	Tue4  string `csv:"火４" json:"tue4"`
	Wed1  string `csv:"水１" json:"wed1"`
	Wed2  string `csv:"水２" json:"wed2"`
	Wed3  string `csv:"水３" json:"wed3"`
	Wed4  string `csv:"水４" json:"wed4"`
	Thu1  string `csv:"木１" json:"thu1"`
	Thu2  string `csv:"木２" json:"thu2"`
	Thu3  string `csv:"木３" json:"thu3"`
	Thu4  string `csv:"木４" json:"thu4"`
	Fri1  string `csv:"金１" json:"fri1"`
	Fri2  string `csv:"金２" json:"fri2"`
	Fri3  string `csv:"金３" json:"fri3"`
	Fri4  string `csv:"金４" json:"fri4"`
}

// CSVインポート結果
type CSVImportResult struct {
	Success      bool                   `json:"success"`
	TotalRows    int                    `json:"total_rows"`
	ProcessedRows int                   `json:"processed_rows"`
	ErrorRows    []CSVErrorRow          `json:"error_rows"`
	Errors       []string               `json:"errors"`
	Data         interface{}            `json:"data,omitempty"`
	ProcessedAt  time.Time              `json:"processed_at"`
}

// CSVエラー行
type CSVErrorRow struct {
	Row    int    `json:"row"`
	Error  string `json:"error"`
	Data   string `json:"data"`
}

// CSVエクスポート設定
type CSVExportConfig struct {
	Type      string                 `json:"type"` // "subjects" or "timetables"
	Filter    map[string]interface{} `json:"filter"`
	Filename  string                 `json:"filename"`
}