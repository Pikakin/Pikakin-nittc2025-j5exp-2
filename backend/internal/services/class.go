package services

import (
	"database/sql"
	"fmt"

	"timetable-change-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type ClassService struct {
	db *sql.DB
}

func NewClassService(db *sql.DB) *ClassService {
	return &ClassService{db: db}
}

// クラス一覧取得
func (s *ClassService) GetClasses(grade int) ([]*models.Class, error) {
	query := squirrel.Select("id", "grade", "class_name", "created_at", "updated_at").
		From("classes").
		OrderBy("grade", "class_name").
		PlaceholderFormat(squirrel.Question)

	if grade > 0 {
		query = query.Where(squirrel.Eq{"grade": grade})
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

	var classes []*models.Class
	for rows.Next() {
		class := &models.Class{}
		err := rows.Scan(
			&class.ID, &class.Grade, &class.ClassName,
			&class.CreatedAt, &class.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}

	return classes, nil
}

// クラス取得（ID指定）
func (s *ClassService) GetClassByID(id int) (*models.Class, error) {
	query := squirrel.Select("id", "grade", "class_name", "created_at", "updated_at").
		From("classes").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	class := &models.Class{}
	err = s.db.QueryRow(sql, args...).Scan(
		&class.ID, &class.Grade, &class.ClassName,
		&class.CreatedAt, &class.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return class, nil
}

// クラス作成
func (s *ClassService) CreateClass(req *models.CreateClassRequest) (*models.Class, error) {
	query := squirrel.Insert("classes").
		Columns("grade", "class_name").
		Values(req.Grade, req.ClassName).
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

	return s.GetClassByID(int(id))
}

// クラス更新
func (s *ClassService) UpdateClass(id int, req *models.UpdateClassRequest) (*models.Class, error) {
	query := squirrel.Update("classes").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	if req.Grade > 0 {
		query = query.Set("grade", req.Grade)
	}
	if req.ClassName != "" {
		query = query.Set("class_name", req.ClassName)
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	return s.GetClassByID(id)
}

// クラス削除
func (s *ClassService) DeleteClass(id int) error {
	query := squirrel.Delete("classes").
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
		return fmt.Errorf("class not found")
	}

	return nil
}