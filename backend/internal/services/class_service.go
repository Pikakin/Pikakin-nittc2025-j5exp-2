package services

import (
	"database/sql"
	"fmt"
	"kosen-schedule-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type ClassService struct {
	db *sql.DB
}

func NewClassService(db *sql.DB) *ClassService {
	return &ClassService{db: db}
}

func (s *ClassService) GetClasses() ([]models.Class, error) {
	query := squirrel.Select("id", "grade", "class_name", "created_at").
		From("classes").
		OrderBy("grade", "class_name").
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build query: %v", err)
	}

	rows, err := s.db.Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var c models.Class
		err := rows.Scan(&c.ID, &c.Grade, &c.ClassName, &c.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		classes = append(classes, c)
	}

	return classes, nil
}

func (s *ClassService) GetClassByID(id int) (*models.Class, error) {
	query := squirrel.Select("id", "grade", "class_name", "created_at").
		From("classes").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlStr, args, err := query.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build query: %v", err)
	}

	var c models.Class
	err = s.db.QueryRow(sqlStr, args...).Scan(&c.ID, &c.Grade, &c.ClassName, &c.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("class not found")
		}
		return nil, fmt.Errorf("failed to get class: %v", err)
	}

	return &c, nil
}