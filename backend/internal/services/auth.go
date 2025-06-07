package services

import (
	"database/sql"
	"errors"
	"kosen-schedule-system/internal/models"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db        *sql.DB
	jwtSecret []byte
}

func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: []byte("your-secret-key"),
	}
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Authenticate - ユーザー認証（handler.goで使用）
func (s *AuthService) Authenticate(email, password string) (*models.User, error) {
	// ユーザーを取得
	query := squirrel.Select("id", "name", "email", "password_hash", "role", "created_at").
		From("users").
		Where(squirrel.Eq{"email": email}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	var user models.User
	var passwordHash string
	err = s.db.QueryRow(sqlQuery, args...).Scan(
		&user.ID, &user.Name, &user.Email, &passwordHash, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("ユーザーが見つかりません")
		}
		return nil, err
	}

	// パスワード検証
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		return nil, errors.New("パスワードが正しくありません")
	}

	return &user, nil
}

// Login - ログイン処理（auth_handler.goで使用）
func (s *AuthService) Login(email, password string) (*models.User, string, error) {
	// ユーザーを取得
	query := squirrel.Select("id", "name", "email", "password_hash", "role", "created_at").
		From("users").
		Where(squirrel.Eq{"email": email}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, "", err
	}

	var user models.User
	var passwordHash string
	err = s.db.QueryRow(sqlQuery, args...).Scan(
		&user.ID, &user.Name, &user.Email, &passwordHash, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "", errors.New("ユーザーが見つかりません")
		}
		return nil, "", err
	}

	// パスワード検証
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		return nil, "", errors.New("パスワードが正しくありません")
	}

	// JWTトークン生成
	token, err := s.GenerateToken(&user)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

// GenerateToken - JWTトークン生成
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// GenerateRefreshToken - リフレッシュトークン生成
func (s *AuthService) GenerateRefreshToken(user *models.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7日間
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// ValidateToken - JWTトークン検証
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("無効なトークンです")
}

// GetUserByID - ユーザー情報取得
func (s *AuthService) GetUserByID(userID int) (*models.User, error) {
	query := squirrel.Select("id", "name", "email", "role", "created_at").
		From("users").
		Where(squirrel.Eq{"id": userID}).
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
		return nil, err
	}

	return &user, nil
}

// ChangePassword - パスワード変更
func (s *AuthService) ChangePassword(userID int, currentPassword, newPassword string) error {
	// 現在のパスワードを確認
	query := squirrel.Select("password_hash").
		From("users").
		Where(squirrel.Eq{"id": userID}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	var currentHash string
	err = s.db.QueryRow(sqlQuery, args...).Scan(&currentHash)
	if err != nil {
		return err
	}

	// 現在のパスワードを検証
	err = bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(currentPassword))
	if err != nil {
		return errors.New("現在のパスワードが正しくありません")
	}

	// 新しいパスワードをハッシュ化
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// パスワードを更新
	updateQuery := squirrel.Update("users").
		Set("password_hash", newHash).
		Where(squirrel.Eq{"id": userID}).
		PlaceholderFormat(squirrel.Question)

	updateSQL, updateArgs, err := updateQuery.ToSql()
	if err != nil {
		return err
	}

	_, err = s.db.Exec(updateSQL, updateArgs...)
	return err
}

// CreateUser - ユーザー作成
func (s *AuthService) CreateUser(email, password, name, role string) (*models.User, error) {
	// メールアドレスの重複チェック
	existingUser, err := s.GetUserByEmail(email)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("このメールアドレスは既に使用されています")
	}

	// パスワードをハッシュ化
	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// ユーザーを作成
	query := squirrel.Insert("users").
		Columns("email", "password_hash", "name", "role").
		Values(email, hashedPassword, name, role).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	result, err := s.db.Exec(sqlQuery, args...)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        int(id),
		Email:     email,
		Name:      name,
		Role:      role,
		CreatedAt: time.Now(),
	}

	return user, nil
}

// GetUserByEmail - メールアドレスでユーザー取得
func (s *AuthService) GetUserByEmail(email string) (*models.User, error) {
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
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// HashPassword - パスワードハッシュ化
func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
