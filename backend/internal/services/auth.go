package services

import (
	"database/sql"
	"errors"
	"time"

	"timetable-change-system/internal/config"
	"timetable-change-system/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db     *sql.DB
	config *config.Config
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(db *sql.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		db:     db,
		config: cfg,
	}
}

// パスワードのハッシュ化
func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// パスワードの検証
func (s *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// JWTトークンの生成
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "timetable-system",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

// リフレッシュトークンの生成
func (s *AuthService) GenerateRefreshToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour) // 7日間
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "timetable-system-refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

// JWTトークンの検証
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// ユーザー認証
func (s *AuthService) Authenticate(email, password string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password_hash, name, role, created_at, updated_at 
			  FROM users WHERE email = ?`
	
	err := s.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, 
		&user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	if !s.CheckPassword(password, user.PasswordHash) {
		return nil, errors.New("invalid password")
	}

	return user, nil
}

// ユーザーIDでユーザー取得
func (s *AuthService) GetUserByID(userID int) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password_hash, name, role, created_at, updated_at 
			  FROM users WHERE id = ?`
	
	err := s.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, 
		&user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// ログイン
func (s *AuthService) Login(email, password string, userService *UserService) (*models.LoginResponse, error) {
	// ユーザー取得
	user, err := userService.GetUserByEmail(email)
	if err != nil {
		return nil, errors.New("メールアドレスまたはパスワードが間違っています")
	}

	// パスワード検証
	if err := userService.VerifyPassword(user.PasswordHash, password); err != nil {
		return nil, errors.New("メールアドレスまたはパスワードが間違っています")
	}

	// JWT生成
	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

// JWT生成
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"user_role": user.Role,
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// JWT検証
func (s *AuthService) VerifyToken(tokenString string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &claims, nil
	}

	return nil, errors.New("無効なトークンです")
}

// パスワード変更
func (s *AuthService) ChangePassword(userID int, currentPassword, newPassword string) error {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	if !s.CheckPassword(currentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}

	query := `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err = s.db.Exec(query, newHash, userID)
	return err
}

// ユーザー作成（管理者用）
func (s *AuthService) CreateUser(email, password, name, role string) (*models.User, error) {
	// ロールの検証
	if role != models.RoleAdmin && role != models.RoleTeacher && role != models.RoleStudent {
		return nil, errors.New("invalid role")
	}

	// メールアドレスの重複チェック
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&count)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("email already exists")
	}

	// パスワードのハッシュ化
	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// ユーザーの作成
	query := `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`
	result, err := s.db.Exec(query, email, hashedPassword, name, role)
	if err != nil {
		return nil, err
	}

	userID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetUserByID(int(userID))
}