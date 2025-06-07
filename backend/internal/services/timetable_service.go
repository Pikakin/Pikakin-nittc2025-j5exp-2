package services

import (
	"database/sql"
	"fmt"

	"kosen-schedule-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type TimetableService struct {
	db *sql.DB
}

func NewTimetableService(db *sql.DB) *TimetableService {
	return &TimetableService{db: db}
}

func (s *TimetableService) GetTimetables(filter models.TimetableFilter) ([]models.Timetable, error) {
	query := squirrel.Select(
		"t.id", "t.class_id", "t.subject_id", "t.teacher_id",
		"t.day_of_week", "t.period", "t.room", "t.created_at",
		"c.class_name", "c.grade", "s.name as subject_name", "u.name as teacher_name",
	).
		From("timetables t").
		Join("classes c ON t.class_id = c.id").
		Join("subjects s ON t.subject_id = s.id").
		Join("users u ON t.teacher_id = u.id").
		PlaceholderFormat(squirrel.Question)

	// フィルター適用（修正: class_id を使用）
	if filter.Grade != nil {
		query = query.Where(squirrel.Eq{"c.grade": *filter.Grade})
	}
	if filter.ClassID != nil {
		query = query.Where(squirrel.Eq{"t.class_id": *filter.ClassID})
	}
	if filter.ClassName != nil {
		query = query.Where(squirrel.Eq{"c.class_name": *filter.ClassName})
	}
	if filter.DayOfWeek != nil {
		query = query.Where(squirrel.Eq{"t.day_of_week": *filter.DayOfWeek})
	}
	if filter.TeacherID != nil {
		query = query.Where(squirrel.Eq{"t.teacher_id": *filter.TeacherID})
	}

	query = query.OrderBy("c.grade", "c.class_name", "t.day_of_week", "t.period")

	sqlStr, args, err := query.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build query: %v", err)
	}

	rows, err := s.db.Query(sqlStr, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	var timetables []models.Timetable
	for rows.Next() {
		var t models.Timetable
		err := rows.Scan(
			&t.ID, &t.ClassID, &t.SubjectID, &t.TeacherID,
			&t.DayOfWeek, &t.Period, &t.Room, &t.CreatedAt, 
			&t.ClassName, &t.Grade, &t.SubjectName, &t.TeacherName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		timetables = append(timetables, t)
	}

	return timetables, nil
}

func (s *TimetableService) GetWeeklyTimetable(classID int) (models.WeeklyTimetable, error) {
	filter := models.TimetableFilter{ClassID: &classID}
	timetables, err := s.GetTimetables(filter)
	if err != nil {
		return nil, err
	}

	weekly := make(models.WeeklyTimetable)
	days := []string{"monday", "tuesday", "wednesday", "thursday", "friday"}
	
	for _, day := range days {
		weekly[day] = make(map[int]*models.Timetable)
	}

	for _, t := range timetables {
		if weekly[t.DayOfWeek] == nil {
			weekly[t.DayOfWeek] = make(map[int]*models.Timetable)
		}
		tCopy := t
		weekly[t.DayOfWeek][t.Period] = &tCopy
	}

	return weekly, nil
}