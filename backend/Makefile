.PHONY: build run test clean docker-build docker-run

# Go アプリケーションのビルド
build:
	go build -o bin/main cmd/main.go

# アプリケーションの実行
run:
	go run cmd/main.go

# テストの実行
test:
	go test ./...

# クリーンアップ
clean:
	rm -rf bin/

# Dockerイメージのビルド
docker-build:
	docker build -t timetable-backend .

# Dockerコンテナの実行
docker-run:
	docker run -p 8080:8080 timetable-backend

# データベースマイグレーション
migrate:
	mariadb -h localhost -u root -p timetable_system < migrations/001_create_tables.sql

# 依存関係の更新
deps:
	go mod tidy
	go mod download

# 開発環境の起動
dev:
	docker-compose up --build

# 開発環境の停止
dev-down:
	docker-compose down

# ログの確認
logs:
	docker-compose logs -f backend