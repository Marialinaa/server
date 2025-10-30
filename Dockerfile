# Multi-stage Dockerfile para construir e rodar o backend Node/TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependências de build (inclui devDeps como typescript)
COPY package*.json ./
RUN npm ci

# Copiar o código fonte e gerar o build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar artefatos de build do estágio builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Porta exposta (usar PORT via env em Railway)
EXPOSE 3001
ENV PORT=3001

# Comando de start (Railway respeitará o CMD no container)
CMD ["node", "dist/index.js"]
