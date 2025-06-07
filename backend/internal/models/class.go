package models

import (
	"time"
)

type Class struct {
	ID        int       `json:"id" db:"id"`
	Grade     int       `json:"grade" db:"grade"`
	ClassName string    `json:"class_name" db:"class_name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateClassRequest struct {
	Grade     int    `json:"grade" validate:"required,min=1,max=5"`
	ClassName string `json:"class_name" validate:"required"`
}

type UpdateClassRequest struct {
	Grade     int    `json:"grade"`
	ClassName string `json:"class_name"`
}