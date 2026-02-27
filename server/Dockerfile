# Dockerfile для Railway с SSH и rsync
FROM node:20-slim

# Устанавливаем openssh-client и rsync для VPS деплоя
RUN apt-get update && apt-get install -y \
    openssh-client \
    rsync \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && ssh -V && rsync --version | head -1

# Создаём рабочую директорию
WORKDIR /app

# Копируем ВСЁ (build context = project root)
COPY . .

# Устанавливаем зависимости (root → web → server через postinstall)
RUN npm ci --include=dev 2>/dev/null || npm install --include=dev

# Собираем web + server
RUN npm run build

# Очищаем devDependencies
RUN cd server && npm prune --production

# Railway использует PORT из env
EXPOSE 3001

# Запускаем через root package.json start script
CMD ["npm", "start"]
