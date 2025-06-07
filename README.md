# 時間割変更システム

高専の時間割変更申請を効率化するWebベースのシステムです。

## 機能概要

- 時間割の表示・管理
- 変更申請の作成・承認
- 重複チェック機能
- CSV インポート/エクスポート
- メール通知機能
- ユーザー権限管理

## 技術スタック

### フロントエンド
- React 19.1.0
- TypeScript
- Material-UI 7.0.1
- Axios

### バックエンド
- Go 1.22.2
- Echo フレームワーク
- MySQL 8.0
- JWT認証

### インフラ
- Docker & Docker Compose

## セットアップ

### 前提条件
- Docker
- Docker Compose

### 起動手順

1. リポジトリのクローン
```bash
git clone <repository-url>
cd timetable-change-system
```

2. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

3. アプリケーションの起動
```bash
docker-compose up -d
```

4. アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080

### 開発環境での起動

#### バックエンド
```bash
cd backend
go mod download
go run cmd/main.go
```

#### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## API仕様

### 認証
- POST /api/auth/login - ログイン
- POST /api/auth/logout - ログアウト
- GET /api/auth/me - 現在のユーザー情報取得

### 時間割
- GET /api/timetables - 時間割一覧取得
- GET /api/timetables/:id - 時間割詳細取得
- POST /api/timetables - 時間割作成（管理者のみ）
- PUT /api/timetables/:id - 時間割更新（管理者のみ）
- DELETE /api/timetables/:id - 時間割削除（管理者のみ）

### 申請
- GET /api/requests - 申請一覧取得
- GET /api/requests/:id - 申請詳細取得
- POST /api/requests - 申請作成（教員のみ）
- PUT /api/requests/:id/approve - 申請承認（管理者のみ）
- PUT /api/requests/:id/reject - 申請却下（管理者のみ）

## ユーザー権限

- **管理者**: 全機能へのアクセス
- **教員**: 申請作成、時間割閲覧
- **学生**: 時間割閲覧のみ

## 開発者向け情報

### プロジェクト構造
```
timetable-change-system/
├── backend/           # Go バックエンド
├── frontend/          # React フロントエンド
├── docs/             # ドキュメント
└── docker-compose.yml
```

### テスト実行
```bash
# バックエンドテスト
cd backend
go test ./...

# フロントエンドテスト
cd frontend
npm test
```

## ライセンス

MIT License
