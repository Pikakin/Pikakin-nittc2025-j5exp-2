package services

import (
	"database/sql" // この行を追加
	"kosen-schedule-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// GetUserByID - ユーザー詳細取得
func (s *UserService) GetUserByID(id int) (*models.User, error) {
	query := squirrel.Select("id", "name", "email", "role", "created_at").
		From("users").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	var user models.User
	err = s.db.QueryRow(sqlQuery, args...).Scan(
		&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows { // 正しく参照
			return nil, nil // ユーザーが見つからない場合
		}
		return nil, err
	}

	return &user, nil
}

// GetUserByEmail - メールアドレスでユーザー取得
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	query := squirrel.Select("id", "name", "email", "role", "created_at").
		From("users").
		Where(squirrel.Eq{"email": email}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	var user models.User
	err = s.db.QueryRow(sqlQuery, args...).Scan(
		&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows { // 正しく参照
			return nil, nil // ユーザーが見つからない場合
		}
		return nil, err
	}

	return &user, nil
}

// GetAllUsers - 全ユーザー一覧取得
func (s *UserService) GetAllUsers() ([]models.User, error) {
	query := squirrel.Select("id", "name", "email", "role", "created_at").
		From("users").
		OrderBy("created_at DESC").
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

// CreateUser - ユーザー作成
func (s *UserService) CreateUser(user *models.User) error {
	query := squirrel.Insert("users").
		Columns("name", "email", "password_hash", "role").
		Values(user.Name, user.Email, user.PasswordHash, user.Role).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	result, err := s.db.Exec(sqlQuery, args...)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = int(id)
	return nil
}

// UpdateUser - ユーザー更新
func (s *UserService) UpdateUser(user *models.User) error {
	query := squirrel.Update("users").
		Set("name", user.Name).
		Set("email", user.Email).
		Set("role", user.Role).
		Where(squirrel.Eq{"id": user.ID}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = s.db.Exec(sqlQuery, args...)
	return err
}

// DeleteUser - ユーザー削除
func (s *UserService) DeleteUser(id int) error {
	query := squirrel.Delete("users").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = s.db.Exec(sqlQuery, args...)
	return err
}
