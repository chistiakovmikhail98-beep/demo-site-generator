# Dockerfile для Railway с SSH и rsync
FROM node:20-slim

# Устанавливаем openssh-client и rsync для VPS деплоя
RUN apt-get update && apt-get install -y \
    openssh-client \
    rsync \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Создаём рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Удаляем devDependencies для уменьшения размера образа
RUN npm prune --production

# Railway использует PORT из env
EXPOSE 3001

# Запускаем сервер
CMD ["node", "dist/index.js"]
