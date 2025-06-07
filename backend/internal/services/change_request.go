package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"timetable-change-system/internal/models"

	"github.com/Masterminds/squirrel"
)

type ChangeRequestService struct {
	db *sql.DB
}

func NewChangeRequestService(db *sql.DB) *ChangeRequestService {
	return &ChangeRequestService{db: db}
}

// 申請一覧取得
func (s *ChangeRequestService) GetChangeRequests(requesterID int, status string, limit, offset int) ([]*models.ChangeRequest, int, error) {
	query := squirrel.Select(
		"cr.id", "cr.requester_id", "cr.title", "cr.description", "cr.status", "cr.request_data",
		"cr.approver_id", "cr.approved_at", "cr.created_at", "cr.updated_at",
		"u1.name", "u1.email",
		"u2.name", "u2.email",
	).
		From("change_requests cr").
		LeftJoin("users u1 ON cr.requester_id = u1.id").
		LeftJoin("users u2 ON cr.approver_id = u2.id").
		OrderBy("cr.created_at DESC").
		PlaceholderFormat(squirrel.Question)

	if requesterID > 0 {
		query = query.Where(squirrel.Eq{"cr.requester_id": requesterID})
	}
	if status != "" {
		query = query.Where(squirrel.Eq{"cr.status": status})
	}

	// 総数取得
	countQuery := squirrel.Select("COUNT(*)").From("change_requests cr").PlaceholderFormat(squirrel.Question)
	if requesterID > 0 {
		countQuery = countQuery.Where(squirrel.Eq{"requester_id": requesterID})
	}
	if status != "" {
		countQuery = countQuery.Where(squirrel.Eq{"status": status})
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
	query = query.Limit(uint64(limit)).Offset(uint64(offset))
	sql, args, err := query.ToSql()
	if err != nil {
		return nil, 0, err
	}

	rows, err := s.db.Query(sql, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var requests []*models.ChangeRequest
	for rows.Next() {
		request := &models.ChangeRequest{
			Requester: &models.User{},
			Approver:  &models.User{},
		}
		var approverName, approverEmail sql.NullString
		err := rows.Scan(
			&request.ID, &request.RequesterID, &request.Title, &request.Description,
			&request.Status, &request.RequestData, &request.ApproverID, &request.ApprovedAt,
			&request.CreatedAt, &request.UpdatedAt,
			&request.Requester.Name, &request.Requester.Email,
			&approverName, &approverEmail,
		)
		if err != nil {
			return nil, 0, err
		}

		if approverName.Valid {
			request.Approver.Name = approverName.String
			request.Approver.Email = approverEmail.String
		} else {
			request.Approver = nil
		}

		requests = append(requests, request)
	}

	return requests, total, nil
}

// 申請取得（ID指定）
func (s *ChangeRequestService) GetChangeRequestByID(id int) (*models.ChangeRequest, error) {
	query := squirrel.Select(
		"cr.id", "cr.requester_id", "cr.title", "cr.description", "cr.status", "cr.request_data",
		"cr.approver_id", "cr.approved_at", "cr.created_at", "cr.updated_at",
		"u1.name", "u1.email",
		"u2.name", "u2.email",
	).
		From("change_requests cr").
		LeftJoin("users u1 ON cr.requester_id = u1.id").
		LeftJoin("users u2 ON cr.approver_id = u2.id").
		Where(squirrel.Eq{"cr.id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	request := &models.ChangeRequest{
		Requester: &models.User{},
		Approver:  &models.User{},
	}
	var approverName, approverEmail sql.NullString
	err = s.db.QueryRow(sql, args...).Scan(
		&request.ID, &request.RequesterID, &request.Title, &request.Description,
		&request.Status, &request.RequestData, &request.ApproverID, &request.ApprovedAt,
		&request.CreatedAt, &request.UpdatedAt,
		&request.Requester.Name, &request.Requester.Email,
		&approverName, &approverEmail,
	)
	if err != nil {
		return nil, err
	}

	if approverName.Valid {
		request.Approver.Name = approverName.String
		request.Approver.Email = approverEmail.String
	} else {
		request.Approver = nil
	}

	return request, nil
}

// 申請作成
func (s *ChangeRequestService) CreateChangeRequest(requesterID int, req *models.CreateChangeRequestRequest) (*models.ChangeRequest, error) {
	requestDataJSON, err := json.Marshal(req.RequestData)
	if err != nil {
		return nil, err
	}

	query := squirrel.Insert("change_requests").
		Columns("requester_id", "title", "description", "request_data", "status").
		Values(requesterID, req.Title, req.Description, requestDataJSON, models.StatusPending).
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

	return s.GetChangeRequestByID(int(id))
}

// 申請更新
func (s *ChangeRequestService) UpdateChangeRequest(id int, req *models.UpdateChangeRequestRequest) (*models.ChangeRequest, error) {
	query := squirrel.Update("change_requests").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	if req.Title != "" {
		query = query.Set("title", req.Title)
	}
	if req.Description != "" {
		query = query.Set("description", req.Description)
	}
	if req.RequestData != nil {
		requestDataJSON, err := json.Marshal(req.RequestData)
		if err != nil {
			return nil, err
		}
		query = query.Set("request_data", requestDataJSON)
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	return s.GetChangeRequestByID(id)
}

// 申請承認
func (s *ChangeRequestService) ApproveChangeRequest(id, approverID int, comment string) (*models.ChangeRequest, error) {
	now := time.Now()
	query := squirrel.Update("change_requests").
		Set("status", models.StatusApproved).
		Set("approver_id", approverID).
		Set("approved_at", now).
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	result, err := s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("change request not found")
	}

	return s.GetChangeRequestByID(id)
}

// 申請却下
func (s *ChangeRequestService) RejectChangeRequest(id, approverID int, comment string) (*models.ChangeRequest, error) {
	now := time.Now()
	query := squirrel.Update("change_requests").
		Set("status", models.StatusRejected).
		Set("approver_id", approverID).
		Set("approved_at", now).
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	result, err := s.db.Exec(sql, args...)
	if err != nil {
		return nil, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("change request not found")
	}

	return s.GetChangeRequestByID(id)
}

// 申請削除
func (s *ChangeRequestService) DeleteChangeRequest(id int) error {
	query := squirrel.Delete("change_requests").
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
		return fmt.Errorf("change request not found")
	}

	return nil
}
