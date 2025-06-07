package services

import (
	"database/sql"
	"fmt"

	"timetable-change-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type TimetableService struct {
	db *sql.DB
}

func NewTimetableService(db *sql.DB) *TimetableService {
	return &TimetableService{db: db}
}

// 時間割一覧取得（フィルタリング対応）
func (s *TimetableService) GetTimetables(classID int, day string) ([]*models.Timetable, error) {
	query := squirrel.Select(
		"t.id", "t.class_id", "t.subject_id", "t.teacher_id", "t.day", "t.period", "t.room",
		"c.grade", "c.class_name",
		"s.code", "s.name", "s.category", "s.term", "s.credits",
		"u.name", "u.email",
	).
		From("timetables t").
		LeftJoin("classes c ON t.class_id = c.id").
		LeftJoin("subjects s ON t.subject_id = s.id").
		LeftJoin("users u ON t.teacher_id = u.id").
		OrderBy("c.grade, c.class_name, t.day, t.period").
		PlaceholderFormat(squirrel.Question)

	if classID > 0 {
		query = query.Where(squirrel.Eq{"t.class_id": classID})
	}
	if day != "" {
		query = query.Where(squirrel.Eq{"t.day": day})
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var timetables []*models.Timetable
	for rows.Next() {
		timetable := &models.Timetable{
			Class:   &models.Class{},
			Subject: &models.Subject{},
			Teacher: &models.User{},
		}
		err := rows.Scan(
			&timetable.ID, &timetable.ClassID, &timetable.SubjectID, &timetable.TeacherID,
			&timetable.Day, &timetable.Period, &timetable.Room,
			&timetable.Class.Grade, &timetable.Class.ClassName,
			&timetable.Subject.Code, &timetable.Subject.Name, &timetable.Subject.Category,
			&timetable.Subject.Term, &timetable.Subject.Credits,
			&timetable.Teacher.Name, &timetable.Teacher.Email,
		)
		if err != nil {
			return nil, err
		}
		timetables = append(timetables, timetable)
	}

	return timetables, nil
}

// 学年別時間割取得
func (s *TimetableService) GetTimetablesByGrade(grade int) ([]*models.Timetable, error) {
	query := squirrel.Select(
		"t.id", "t.class_id", "t.subject_id", "t.teacher_id", "t.day", "t.period", "t.room",
		"c.grade", "c.class_name",
		"s.code", "s.name", "s.category", "s.term", "s.credits",
		"u.name", "u.email",
	).
		From("timetables t").
		LeftJoin("classes c ON t.class_id = c.id").
		LeftJoin("subjects s ON t.subject_id = s.id").
		LeftJoin("users u ON t.teacher_id = u.id").
		Where(squirrel.Eq{"c.grade": grade}).
		OrderBy("c.class_name, t.day, t.period").
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var timetables []*models.Timetable
	for rows.Next() {
		timetable := &models.Timetable{
			Class:   &models.Class{},
			Subject: &models.Subject{},
			Teacher: &models.User{},
		}
		err := rows.Scan(
			&timetable.ID, &timetable.ClassID, &timetable.SubjectID, &timetable.TeacherID,
			&timetable.Day, &timetable.Period, &timetable.Room,
			&timetable.Class.Grade, &timetable.Class.ClassName,
			&timetable.Subject.Code, &timetable.Subject.Name, &timetable.Subject.Category,
			&timetable.Subject.Term, &timetable.Subject.Credits,
			&timetable.Teacher.Name, &timetable.Teacher.Email,
		)
		if err != nil {
			return nil, err
		}
		timetables = append(timetables, timetable)
	}

	return timetables, nil
}

// 週間時間割取得（グリッド形式）
func (s *TimetableService) GetWeeklyTimetable(classID int) (map[string]map[int]*models.Timetable, error) {
	timetables, err := s.GetTimetables(classID, "")
	if err != nil {
		return nil, err
	}

	// 週間時間割をマップ形式で整理
	weeklyTimetable := make(map[string]map[int]*models.Timetable)
	days := []string{"monday", "tuesday", "wednesday", "thursday", "friday"}
	
	for _, day := range days {
		weeklyTimetable[day] = make(map[int]*models.Timetable)
	}

	for _, timetable := range timetables {
		if weeklyTimetable[timetable.Day] == nil {
			weeklyTimetable[timetable.Day] = make(map[int]*models.Timetable)
		}
		weeklyTimetable[timetable.Day][timetable.Period] = timetable
	}

	return weeklyTimetable, nil
}



// 時間割取得（ID指定）
func (s *TimetableService) GetTimetableByID(id int) (*models.Timetable, error) {
	query := squirrel.Select(
		"t.id", "t.class_id", "t.subject_id", "t.teacher_id", "t.day", "t.period", "t.room", "t.created_at", "t.updated_at",
		"c.grade", "c.class_name",
		"s.code", "s.name", "s.category", "s.term", "s.credits",
		"u.name", "u.email",
	).
		From("timetables t").
		LeftJoin("classes c ON t.class_id = c.id").
		LeftJoin("subjects s ON t.subject_id = s.id").
		LeftJoin("users u ON t.teacher_id = u.id").
		Where(squirrel.Eq{"t.id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	timetable := &models.Timetable{
		Class:   &models.Class{},
		Subject: &models.Subject{},
		Teacher: &models.User{},
	}
	err = s.db.QueryRow(sql, args...).Scan(
		&timetable.ID, &timetable.ClassID, &timetable.SubjectID, &timetable.TeacherID,
		&timetable.Day, &timetable.Period, &timetable.Room, &timetable.CreatedAt, &timetable.UpdatedAt,
		&timetable.Class.Grade, &timetable.Class.ClassName,
		&timetable.Subject.Code, &timetable.Subject.Name, &timetable.Subject.Category,
		&timetable.Subject.Term, &timetable.Subject.Credits,
		&timetable.Teacher.Name, &timetable.Teacher.Email,
	)
	if err != nil {
		return nil, err
	}

	return timetable, nil
}

// 時間割作成
func (s *TimetableService) CreateTimetable(req *models.CreateTimetableRequest) (*models.Timetable, error) {
	// 重複チェック
	if err := s.checkConflicts(req.ClassID, req.TeacherID, req.Day, req.Period, req.Room, 0); err != nil {
		return nil, err
	}

	query := squirrel.Insert("timetables").
		Columns("class_id", "subject_id", "teacher_id", "day", "period", "room").
		Values(req.ClassID, req.SubjectID, req.TeacherID, req.Day, req.Period, req.Room).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	result, err := s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetTimetableByID(int(id))
}

// 時間割更新
func (s *TimetableService) UpdateTimetable(id int, req *models.UpdateTimetableRequest) (*models.Timetable, error) {
	// 重複チェック
	if err := s.checkConflicts(req.ClassID, req.TeacherID, req.Day, req.Period, req.Room, id); err != nil {
		return nil, err
	}

	query := squirrel.Update("timetables").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	if req.ClassID > 0 {
		query = query.Set("class_id", req.ClassID)
	}
	if req.SubjectID > 0 {
		query = query.Set("subject_id", req.SubjectID)
	}
	if req.TeacherID > 0 {
		query = query.Set("teacher_id", req.TeacherID)
	}
	if req.Day != "" {
		query = query.Set("day", req.Day)
	}
	if req.Period > 0 {
		query = query.Set("period", req.Period)
	}
	if req.Room != "" {
		query = query.Set("room", req.Room)
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	return s.GetTimetableByID(id)
}

// 時間割削除
func (s *TimetableService) DeleteTimetable(id int) error {
	query := squirrel.Delete("timetables").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	result, err := s.db.Exec(sql, args...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("timetable not found")
	}

	return nil
}

// 重複チェック
func (s *TimetableService) checkConflicts(classID, teacherID int, day string, period int, room string, excludeID int) error {
	// クラスの時間重複チェック
	if classID > 0 && day != "" && period > 0 {
		query := squirrel.Select("COUNT(*)").
			From("timetables").
			Where(squirrel.Eq{"class_id": classID, "day": day, "period": period}).
			PlaceholderFormat(squirrel.Question)

		if excludeID > 0 {
			query = query.Where(squirrel.NotEq{"id": excludeID})
		}

		sql, args, err := query.ToSql()
		if err != nil {
			return err
		}

		var count int
		err = s.db.QueryRow(sql, args...).Scan(&count)
		if err != nil {
			return err
		}

		if count > 0 {
			return fmt.Errorf("クラスの時間が重複しています")
		}
	}

	// 教員の時間重複チェック
	if teacherID > 0 && day != "" && period > 0 {
		query := squirrel.Select("COUNT(*)").
			From("timetables").
			Where(squirrel.Eq{"teacher_id": teacherID, "day": day, "period": period}).
			PlaceholderFormat(squirrel.Question)

		if excludeID > 0 {
			query = query.Where(squirrel.NotEq{"id": excludeID})
		}

		sql, args, err := query.ToSql()
		if err != nil {
			return err
		}

		var count int
		err = s.db.QueryRow(sql, args...).Scan(&count)
		if err != nil {
			return err
		}

		if count > 0 {
			return fmt.Errorf("教員の時間が重複しています")
		}
	}

	// 教室の重複チェック
	if room != "" && day != "" && period > 0 {
		query := squirrel.Select("COUNT(*)").
			From("timetables").
			Where(squirrel.Eq{"room": room, "day": day, "period": period}).
			PlaceholderFormat(squirrel.Question)

		if excludeID > 0 {
			query = query.Where(squirrel.NotEq{"id": excludeID})
		}

		sql, args, err := query.ToSql()
		if err != nil {
			return err
		}

		var count int
		err = s.db.QueryRow(sql, args...).Scan(&count)
		if err != nil {
			return err
		}

		if count > 0 {
			return fmt.Errorf("教室が重複しています")
		}
	}

	return nil
}
