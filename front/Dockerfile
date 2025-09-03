# ベースイメージに Node.js を指定
FROM node:20

# 作業ディレクトリを作成
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install --save-dev @types/google.maps

# ソースコードをコピー
COPY . .

EXPOSE 3080

CMD ["npm", "run", "dev"]
