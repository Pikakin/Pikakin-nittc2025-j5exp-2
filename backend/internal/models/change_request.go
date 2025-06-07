package models

import (
	"encoding/json"
	"time"
)

type ChangeRequest struct {
	ID          int             `json:"id" db:"id"`
	RequesterID int             `json:"requester_id" db:"requester_id"`
	Title       string          `json:"title" db:"title"`
	Description string          `json:"description" db:"description"`
	Status      string          `json:"status" db:"status"`
	RequestData json.RawMessage `json:"request_data" db:"request_data"`
	ApproverID  *int            `json:"approver_id" db:"approver_id"`
	ApprovedAt  *time.Time      `json:"approved_at" db:"approved_at"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
	
	// 関連データ
	Requester *User `json:"requester,omitempty"`
	Approver  *User `json:"approver,omitempty"`
}

type CreateChangeRequestRequest struct {
	Title       string      `json:"title" validate:"required"`
	Description string      `json:"description" validate:"required"`
	RequestData interface{} `json:"request_data" validate:"required"`
}

type UpdateChangeRequestRequest struct {
	Title       string      `json:"title"`
	Description string      `json:"description"`
	RequestData interface{} `json:"request_data"`
}

type ApproveRequestRequest struct {
	Comment string `json:"comment"`
}

type RejectRequestRequest struct {
	Comment string `json:"comment" validate:"required"`
}

// 申請ステータスの定数
const (
	StatusPending  = "pending"
	StatusApproved = "approved"
	StatusRejected = "rejected"
	StatusCanceled = "canceled"
)

// 申請データの構造体
type TimetableChangeData struct {
	OriginalTimetableID int    `json:"original_timetable_id"`
	NewClassID          int    `json:"new_class_id"`
	NewSubjectID        int    `json:"new_subject_id"`
	NewTeacherID        int    `json:"new_teacher_id"`
	NewDay              string `json:"new_day"`
	NewPeriod           int    `json:"new_period"`
	NewRoom             string `json:"new_room"`
	Reason              string `json:"reason"`
}