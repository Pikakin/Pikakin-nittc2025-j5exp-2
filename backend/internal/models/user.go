package models

import "time"

// ユーザー構造体
type User struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	Role      string    `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// パスワード変更用構造体
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required,min=6"`
}

// ユーザー作成用構造体
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role" validate:"required,oneof=admin teacher student"`
}

// ユーザー更新用構造体
type UpdateUserRequest struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email,omitempty"`
	Role  string `json:"role,omitempty"`
}

// ユーザーロールの定数
const (
	RoleAdmin   = "admin"
	RoleTeacher = "teacher"
	RoleStudent = "student"
)

// ロールの権限チェック
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

func (u *User) IsTeacher() bool {
	return u.Role == RoleTeacher
}

func (u *User) IsStudent() bool {
	return u.Role == RoleStudent
}

func (u *User) CanCreateRequest() bool {
	return u.Role == RoleTeacher || u.Role == RoleAdmin
}

func (u *User) CanApproveRequest() bool {
	return u.Role == RoleAdmin
}