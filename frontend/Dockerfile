# Node.js 24を使用
FROM node:24-alpine AS builder

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# 本番用の軽量イメージ
FROM nginx:alpine

# ビルドしたファイルをnginxの公開ディレクトリにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# nginxの設定ファイルをコピー（SPAルーティング対応）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート80を公開
EXPOSE 80

# nginxを起動
CMD ["nginx", "-g", "daemon off;"]