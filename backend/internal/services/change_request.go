package services

import (
	"database/sql" // この行を確認
	"encoding/json"
	"kosen-schedule-system/internal/models"
	"time"

	"github.com/Masterminds/squirrel"
)

type ChangeRequestService struct {
	db *sql.DB
}

func NewChangeRequestService(db *sql.DB) *ChangeRequestService {
	return &ChangeRequestService{db: db}
}

// CreateChangeRequest - 変更申請作成
func (s *ChangeRequestService) CreateChangeRequest(request *models.ChangeRequest) error {
	// request_dataをJSONに変換
	requestDataJSON, err := json.Marshal(request.RequestData)
	if err != nil {
		return err
	}

	query := squirrel.Insert("change_requests").
		Columns("requester_id", "status", "request_data", "created_at", "updated_at").
		Values(request.RequesterID, request.Status, string(requestDataJSON), time.Now(), time.Now()).
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

	request.ID = int(id)
	return nil
}

// GetChangeRequestByID - 変更申請詳細取得
func (s *ChangeRequestService) GetChangeRequestByID(id int) (*models.ChangeRequest, error) {
	query := squirrel.Select(
		"cr.id", "cr.requester_id", "cr.status", "cr.request_data", 
		"cr.created_at", "cr.updated_at",
		"u.name as requester_name", "u.email as requester_email",
	).
		From("change_requests cr").
		LeftJoin("users u ON cr.requester_id = u.id").
		Where(squirrel.Eq{"cr.id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	var request models.ChangeRequest
	var requester models.User
	var requestDataJSON string
	var requesterName, requesterEmail sql.NullString // 修正: sql.NullString を正しく参照

	err = s.db.QueryRow(sqlQuery, args...).Scan(
		&request.ID, &request.RequesterID, &request.Status, &requestDataJSON,
		&request.CreatedAt, &request.UpdatedAt,
		&requesterName, &requesterEmail,
	)
	if err != nil {
		return nil, err
	}

	// JSONをパース
	err = json.Unmarshal([]byte(requestDataJSON), &request.RequestData)
	if err != nil {
		return nil, err
	}

	// リレーション設定
	if requesterName.Valid {
		requester.ID = request.RequesterID
		requester.Name = requesterName.String
		requester.Email = requesterEmail.String
		request.Requester = &requester
	}

	return &request, nil
}

// GetChangeRequests - 変更申請一覧取得
func (s *ChangeRequestService) GetChangeRequests(filter models.RequestFilter) ([]models.ChangeRequest, error) {
	query := squirrel.Select(
		"cr.id", "cr.requester_id", "cr.status", "cr.request_data", 
		"cr.created_at", "cr.updated_at",
		"u.name as requester_name", "u.email as requester_email",
	).
		From("change_requests cr").
		LeftJoin("users u ON cr.requester_id = u.id").
		PlaceholderFormat(squirrel.Question)

	// フィルター条件を追加
	if filter.Status != nil {
		query = query.Where(squirrel.Eq{"cr.status": *filter.Status})
	}
	if filter.RequesterID != nil {
		query = query.Where(squirrel.Eq{"cr.requester_id": *filter.RequesterID})
	}
	if filter.DateFrom != nil {
		query = query.Where(squirrel.GtOrEq{"cr.created_at": *filter.DateFrom})
	}
	if filter.DateTo != nil {
		query = query.Where(squirrel.LtOrEq{"cr.created_at": *filter.DateTo})
	}

	query = query.OrderBy("cr.created_at DESC")

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.ChangeRequest
	for rows.Next() {
		var request models.ChangeRequest
		var requester models.User
		var requestDataJSON string
		var requesterName, requesterEmail sql.NullString // 修正: sql.NullString を正しく参照

		err := rows.Scan(
			&request.ID, &request.RequesterID, &request.Status, &requestDataJSON,
			&request.CreatedAt, &request.UpdatedAt,
			&requesterName, &requesterEmail,
		)
		if err != nil {
			return nil, err
		}

		// JSONをパース
		err = json.Unmarshal([]byte(requestDataJSON), &request.RequestData)
		if err != nil {
			return nil, err
		}

		// リレーション設定
		if requesterName.Valid {
			requester.ID = request.RequesterID
			requester.Name = requesterName.String
			requester.Email = requesterEmail.String
			request.Requester = &requester
		}

		requests = append(requests, request)
	}

	return requests, nil
}

// UpdateChangeRequestStatus - 変更申請ステータス更新
func (s *ChangeRequestService) UpdateChangeRequestStatus(id int, status string) error {
	query := squirrel.Update("change_requests").
		Set("status", status).
		Set("updated_at", time.Now()).
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = s.db.Exec(sqlQuery, args...)
	return err
}

// ApproveChangeRequest - 変更申請承認
func (s *ChangeRequestService) ApproveChangeRequest(id int) error {
	return s.UpdateChangeRequestStatus(id, "approved")
}

// RejectChangeRequest - 変更申請却下
func (s *ChangeRequestService) RejectChangeRequest(id int) error {
	return s.UpdateChangeRequestStatus(id, "rejected")
}

// DeleteChangeRequest - 変更申請削除
func (s *ChangeRequestService) DeleteChangeRequest(id int) error {
	query := squirrel.Delete("change_requests").
		Where(squirrel.Eq{"id": id}).
		PlaceholderFormat(squirrel.Question)

	sqlQuery, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = s.db.Exec(sqlQuery, args...)
	return err
}
