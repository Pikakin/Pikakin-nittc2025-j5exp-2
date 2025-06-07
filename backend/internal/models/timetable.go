package models

import (
	"time"
)

type Timetable struct {
	ID          int       `json:"id" db:"id"`
	ClassID     int       `json:"class_id" db:"class_id"`
	SubjectID   int       `json:"subject_id" db:"subject_id"`
	TeacherID   int       `json:"teacher_id" db:"teacher_id"`
	DayOfWeek   string    `json:"day_of_week" db:"day_of_week"`
	Period      int       `json:"period" db:"period"`
	Room        string    `json:"room" db:"room"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	
	// 関連データ
	ClassName   string `json:"class_name" db:"class_name"`
	Grade       int    `json:"grade" db:"grade"`
	SubjectName string `json:"subject_name" db:"subject_name"`
	TeacherName string `json:"teacher_name" db:"teacher_name"`
}

type WeeklyTimetable map[string]map[int]*Timetable // day -> period -> timetable

type TimetableFilter struct {
	Grade     *int    `json:"grade"`
	ClassID   *int    `json:"class_id"`        // 修正: ClassID に統一
	ClassName *string `json:"class_name"`
	DayOfWeek *string `json:"day_of_week"`
	TeacherID *int    `json:"teacher_id"`
}

type CreateTimetableRequest struct {
	ClassID   int    `json:"class_id" validate:"required"`
	SubjectID int    `json:"subject_id" validate:"required"`
	TeacherID int    `json:"teacher_id" validate:"required"`
	Day       string `json:"day" validate:"required"`
	Period    int    `json:"period" validate:"required,min=1,max=4"`
	Room      string `json:"room" validate:"required"`
}

type UpdateTimetableRequest struct {
	ClassID   int    `json:"class_id"`
	SubjectID int    `json:"subject_id"`
	TeacherID int    `json:"teacher_id"`
	Day       string `json:"day"`
	Period    int    `json:"period"`
	Room      string `json:"room"`
}

// 曜日の定数
const (
	DayMonday    = "月"
	DayTuesday   = "火"
	DayWednesday = "水"
	DayThursday  = "木"
	DayFriday    = "金"
)

// 時限の定数
const (
	Period1 = 1
	Period2 = 2
	Period3 = 3
	Period4 = 4
)