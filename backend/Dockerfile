# マルチステージビルドではなく、Goランタイムを含むイメージを使用
FROM golang:1.24.4-alpine AS base

# 必要なパッケージをインストール
RUN apk add --no-cache git ca-certificates tzdata

# 作業ディレクトリを設定
WORKDIR /app

# go.modとgo.sumをコピー
COPY go.mod go.sum ./

# 依存関係をダウンロード
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/main.go

# 実行用のイメージ（Goランタイム付き）
FROM golang:1.24.4-alpine

# 必要なパッケージをインストール
RUN apk add --no-cache ca-certificates tzdata mariadb-client

# 作業ディレクトリを設定
WORKDIR /root/

# ビルドしたバイナリとソースコードをコピー
COPY --from=base /app/main .
COPY --from=base /app /app

# ポートを公開
EXPOSE 8080

# アプリケーションを実行
CMD ["./main"]
