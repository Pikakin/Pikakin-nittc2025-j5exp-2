package services

import (
	"database/sql"
	"fmt"

	"timetable-change-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type SubjectService struct {
	db *sql.DB
}

func NewSubjectService(db *sql.DB) *SubjectService {
	return &SubjectService{db: db}
}

// 科目一覧取得
func (s *SubjectService) GetSubjects(limit, offset int, category, term string) ([]*models.Subject, int, error) {
	query := squirrel.Select("id", "code", "name", "category", "term", "credits", "description", "created_at", "updated_at").
		From("subjects").
		PlaceholderFormat(squirrel.Question)

	if category != "" {
		query = query.Where(squirrel.Eq{"category": category})
	}
	if term != "" {
		query = query.Where(squirrel.Eq{"term": term})
	}

	// 総数取得
	countQuery := squirrel.Select("COUNT(*)").From("subjects").PlaceholderFormat(squirrel.Question)
	if category != "" {
		countQuery = countQuery.Where(squirrel.Eq{"category": category})
	}
	if term != "" {
		countQuery = countQuery.Where(squirrel.Eq{"term": term})
	}

	countSql, countArgs, err := countQuery.ToSql()
	if err != nil {
		return nil, 0, err
	}

	var total int
	err = s.db.QueryRow(countSql, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// データ取得
	query = query.OrderBy("code").Limit(uint64(limit)).Offset(uint64(offset))
	sql, args, err := query.ToSql()
	if err != nil {
		return nil, 0, err
	}

	rows, err := s.db.Query(sql, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var subjects []*models.Subject
	for rows.Next() {
		subject := &models.Subject{}
		err := rows.Scan(
			&subject.ID, &subject.Code, &subject.Name, &subject.Category,
			&subject.Term, &subject.Credits, &subject.Description,
			&subject.CreatedAt, &subject.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		subjects = append(subjects, subject)
	}

	return subjects, total, nil
}

// 科目取得（ID指定）
func (s *SubjectService) GetSubjectByID(id int) (*models.Subject, error) {
	query := squirrel.Select("id", "code", "name", "category", "term", "credits", "description", "created_at", "updated_at").
		From("subjects").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	subject := &models.Subject{}
	err = s.db.QueryRow(sql, args...).Scan(
		&subject.ID, &subject.Code, &subject.Name, &subject.Category,
		&subject.Term, &subject.Credits, &subject.Description,
		&subject.CreatedAt, &subject.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return subject, nil
}

// 科目作成
func (s *SubjectService) CreateSubject(req *models.CreateSubjectRequest) (*models.Subject, error) {
	query := squirrel.Insert("subjects").
		Columns("code", "name", "category", "term", "credits", "description").
		Values(req.Code, req.Name, req.Category, req.Term, req.Credits, req.Description).
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

	return s.GetSubjectByID(int(id))
}

// 科目更新
func (s *SubjectService) UpdateSubject(id int, req *models.UpdateSubjectRequest) (*models.Subject, error) {
	query := squirrel.Update("subjects").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	if req.Code != "" {
		query = query.Set("code", req.Code)
	}
	if req.Name != "" {
		query = query.Set("name", req.Name)
	}
	if req.Category != "" {
		query = query.Set("category", req.Category)
	}
	if req.Term != "" {
		query = query.Set("term", req.Term)
	}
	if req.Credits > 0 {
		query = query.Set("credits", req.Credits)
	}
	query = query.Set("description", req.Description)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	return s.GetSubjectByID(id)
}

// 科目削除
func (s *SubjectService) DeleteSubject(id int) error {
	query := squirrel.Delete("subjects").
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
		return fmt.Errorf("subject not found")
	}

	return nil
}
