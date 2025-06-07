package models

import (
	"time"
)

type Subject struct {
	ID          int       `json:"id" db:"id"`
	Code        string    `json:"code" db:"code"`
	Name        string    `json:"name" db:"name"`
	Category    string    `json:"category" db:"category"`
	Term        string    `json:"term" db:"term"`
	Credits     int       `json:"credits" db:"credits"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type CreateSubjectRequest struct {
	Code        string `json:"code" validate:"required"`
	Name        string `json:"name" validate:"required"`
	Category    string `json:"category" validate:"required"`
	Term        string `json:"term" validate:"required"`
	Credits     int    `json:"credits" validate:"required,min=1"`
	Description string `json:"description"`
}

type UpdateSubjectRequest struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Term        string `json:"term"`
	Credits     int    `json:"credits"`
	Description string `json:"description"`
}

// 科目区分の定数
const (
	CategoryGeneral    = "一般"
	CategorySpecialty  = "専門"
	CategoryExperiment = "実験"
	CategoryPractice   = "実習"
)

// 開講期間の定数
const (
	TermFirstHalf  = "前期"
	TermSecondHalf = "後期"
	TermFullYear   = "通年"
)