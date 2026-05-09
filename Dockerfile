FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev 2>&1 || npm install 2>&1

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
