# ベースイメージに Node.js を指定
FROM node:20

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係を先にコピーしてインストール（キャッシュ効率向上）
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# Next.js ビルド
RUN npm run build

# ポート番号を公開
EXPOSE 3080

# 開発サーバー起動用（本番は `npm start`）
CMD ["npm", "run", "dev"]
