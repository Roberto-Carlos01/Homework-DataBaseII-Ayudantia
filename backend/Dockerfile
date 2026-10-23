FROM node:22-alpine

WORKDIR /app

# Activar pnpm (la versión se toma de "packageManager" en package.json)
RUN corepack enable

# 1. Instalar dependencias
#    Se copian primero solo estos archivos para aprovechar la caché de Docker:
#    si el código cambia pero las dependencias no, este paso no se repite.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Copiar el código
COPY . .

# 3. Construir NestJS (TypeScript -> JavaScript en /app/dist)
RUN pnpm build

# 4. Ejecutar la aplicación
EXPOSE 3000
CMD ["node", "dist/main"]
