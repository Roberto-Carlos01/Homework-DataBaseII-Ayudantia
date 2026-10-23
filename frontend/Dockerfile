FROM node:22-alpine

WORKDIR /app

# Activar pnpm (la versión se toma de "packageManager" en package.json)
RUN corepack enable

# 1. Instalar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el código
COPY . .

# URL del backend que usará el NAVEGADOR.
# Las variables NEXT_PUBLIC_* se incrustan en el JavaScript durante el build,
# por eso se pasan como ARG (en "docker build") y no en "docker run".
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Construir el proyecto
RUN pnpm build

# 3. Ejecutar en producción, 4. en 0.0.0.0, 5. puerto 3001
#    (ver script "start" en package.json: next start -H 0.0.0.0 -p 3001)
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "start"]
