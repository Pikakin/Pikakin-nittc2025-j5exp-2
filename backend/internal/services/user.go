package services

import (
	"database/sql"
	"errors"

	"timetable-change-system/internal/models"

	"github.com/Masterminds/squirrel"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// メールアドレスでユーザーを取得
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	query := squirrel.Select("id", "email", "password_hash", "name", "role", "created_at", "updated_at").
		From("users").
		Where(squirrel.Eq{"email": email}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	user := &models.User{}
	err = s.db.QueryRow(sql, args...).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("ユーザーが見つかりません")
		}
		return nil, err
	}

	return user, nil
}

// IDでユーザーを取得
func (s *UserService) GetUserByID(id int) (*models.User, error) {
	query := squirrel.Select("id", "email", "password_hash", "name", "role", "created_at", "updated_at").
		From("users").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	user := &models.User{}
	err = s.db.QueryRow(sql, args...).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("ユーザーが見つかりません")
		}
		return nil, err
	}

	return user, nil
}

// パスワード検証
func (s *UserService) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// テスト用ユーザー作成
func (s *UserService) CreateTestUser(email, password, name, role string) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	query := squirrel.Insert("users").
		Columns("email", "password_hash", "name", "role").
		Values(email, string(hashedPassword), name, role).
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

	return s.GetUserByID(int(id))
}