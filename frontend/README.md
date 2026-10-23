# Frontend — Next.js 16.2.2

Interfaz web de `docker_tienda` para administrar **productos** y **categorías**.
Consume la API REST del backend NestJS.

```
┌─────────────────────┐
│ Next.js 16.2.2      │   http://localhost:3001
│ Frontend :3001      │
└──────────┬──────────┘
           │  fetch (desde el navegador)
           ▼
┌─────────────────────┐
│ NestJS 11.2.3       │   http://localhost:3000
│ Backend :3000       │
└──────────┬──────────┘
           │  TypeORM
           ▼
┌─────────────────────┐
│ PostgreSQL 16       │
│ Database :5432      │
└─────────────────────┘
```

**Tecnologías:** Next.js 16.2.2 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · pnpm · `fetch` (sin Axios).

> ⚠️ Next.js está fijado **exactamente** en `16.2.2`. No ejecutes `pnpm update` ni `pnpm add next@latest`.

---

## Estructura

```
frontend/
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json / pnpm-lock.yaml
└── src/
    ├── lib/
    │   ├── api.ts          -> capa HTTP: TODAS las llamadas al backend
    │   ├── types.ts        -> tipos Product y Category
    │   └── format.ts
    ├── components/
    │   ├── ProductForm.tsx -> formulario de crear/editar producto
    │   └── ErrorMessage.tsx
    └── app/
        ├── layout.tsx               -> menú y pie de página
        ├── page.tsx                 -> redirige a /products
        ├── products/page.tsx        -> /products            (lista)
        ├── products/new/page.tsx    -> /products/new        (crear)
        ├── products/[id]/page.tsx   -> /products/[id]       (ver)
        ├── products/[id]/edit/page.tsx -> /products/[id]/edit (editar)
        └── categories/page.tsx      -> /categories          (lista, crear, editar, eliminar)
```

| Página | Qué hace |
|---|---|
| `/products` | Tabla con nombre, descripción, precio, stock y categoría. Editar y eliminar. |
| `/products/new` | Crear un producto. |
| `/products/[id]` | Ver un producto. |
| `/products/[id]/edit` | Editar un producto. |
| `/categories` | Listar, crear, editar (en la misma fila) y eliminar categorías. |

---

## 1. Instalación

Requisitos: **Node 22** (Next.js 16 necesita Node ≥ 20.9) y **pnpm**.

```bash
cd frontend
pnpm install
```

> Durante la instalación pnpm puede mostrar `Ignored build scripts: sharp`. Es solo un aviso y se puede ignorar: la aplicación no lo necesita.

---

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

La URL del backend está definida en **un solo lugar**: [`src/lib/api.ts`](src/lib/api.ts). Los componentes nunca escriben la URL; llaman a funciones como `getProducts()` o `createProduct()`.

```ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
```

### ⚠️ Importante: las variables `NEXT_PUBLIC_*`

- Next.js **copia el valor** de las variables que empiezan con `NEXT_PUBLIC_` dentro del JavaScript que se envía al navegador.
- Por eso **cualquier persona puede verlas** (DevTools → Sources). **Nunca** pongas contraseñas, tokens ni claves en una variable `NEXT_PUBLIC_*`.
- El valor se incrusta **durante `pnpm build`**, no al iniciar la aplicación. Si cambias la variable, **hay que volver a construir**.

Una URL pública de la API no es un secreto, así que `NEXT_PUBLIC_API_URL` es correcta aquí.

---

## 3. Ejecución local (sin Docker)

1. Levanta PostgreSQL y el backend (ver `../README.md` y `../backend/README.md`).
2. Comprueba que el backend responde: <http://localhost:3000/health>
3. Inicia el frontend:

```bash
pnpm dev
```

Abre <http://localhost:3001>.

Build de producción local:

```bash
pnpm build
pnpm start
```

---

## 4. Conexión con NestJS

Todas las páginas son componentes de cliente (`'use client'`): el **navegador** hace las peticiones `fetch` directamente al backend.

```
Navegador (tu PC) ──GET http://localhost:3000/products──▶ NestJS ──▶ PostgreSQL
```

Para que funcione:

- El backend debe tener **CORS habilitado** (`app.enableCors()` en `backend/src/main.ts`), porque el frontend (`:3001`) y el backend (`:3000`) son orígenes distintos.
- El puerto `3000` del backend debe estar publicado en tu PC (`-p 3000:3000`).

Si el backend no responde, la página muestra:
`No se pudo conectar con el backend en http://localhost:3000`.

El pie de página muestra siempre a qué URL se está conectando el frontend.

---

## 5. Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN corepack enable

# 1. Instalar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# URL del backend (se incrusta en el build)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 2. Construir el proyecto
RUN pnpm build

# 3. Producción, 4. 0.0.0.0, 5. puerto 3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "start"]
```

- `pnpm start` ejecuta `next start -H 0.0.0.0 -p 3001`.
- **`0.0.0.0`**: escucha en todas las interfaces de red del contenedor. Si escuchara solo en `localhost`, nadie fuera del contenedor podría acceder.
- **`ARG NEXT_PUBLIC_API_URL`**: como la variable se incrusta durante el build, se pasa en `docker build`, no en `docker run`.

---

## 6. docker build

Desde la carpeta `docker-clase/`:

```bash
docker build -t docker-frontend ./frontend
```

Con otra URL de backend:

```bash
docker build -t docker-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 ./frontend
```

---

## 7. docker run y el puerto 3001

```bash
docker run -d \
  --name docker-frontend \
  -p 3001:3001 \
  docker-frontend
```

PowerShell:

```powershell
docker run -d --name docker-frontend -p 3001:3001 docker-frontend
```

Abre <http://localhost:3001>.

- `-p 3001:3001` → `puerto_de_tu_PC:puerto_del_contenedor`. Next.js escucha en el `3001` **dentro** del contenedor, y Docker lo publica en el `3001` de tu PC.

> ❓ **Pregunta para la clase:** ¿funciona `docker run -e NEXT_PUBLIC_API_URL=http://otra-url ...`?
> **No.** El valor ya quedó incrustado en el JavaScript durante `docker build`. Hay que reconstruir con `--build-arg`.

---

## 8. Comunicación con el backend (y Docker Compose)

Esta es la pregunta clave: **¿quién hace la petición al backend?**

| Quién llama | Desde dónde | URL correcta del backend |
|---|---|---|
| El **navegador** (este proyecto) | Tu PC | `http://localhost:3000` |
| Un **contenedor** (ej. NestJS → PostgreSQL) | La red de Docker | `http://nombre-del-servicio:puerto` |

En este proyecto el código de React se ejecuta **en el navegador del usuario**, que está en tu PC, **fuera** de Docker. El navegador no conoce la red interna de Docker, así que no puede resolver el nombre `backend`. Por eso:

- **Local:** `NEXT_PUBLIC_API_URL=http://localhost:3000`
- **Docker:** `NEXT_PUBLIC_API_URL=http://localhost:3000`
- **Docker Compose:** `NEXT_PUBLIC_API_URL=http://localhost:3000` (y el backend publica `3000:3000`)

En cambio, el **backend** sí se ejecuta dentro de Docker, y por eso usa `DB_HOST=database` para llegar a PostgreSQL.

```
                ┌──────────────── red de Docker Compose ────────────────┐
                │                                                       │
Navegador ──────┼──▶ frontend:3001   (entrega HTML/JS)                  │
   │            │                                                       │
   └────────────┼──▶ backend:3000 ──── database:5432 ──▶ database       │
 localhost:3000 │    (DB_HOST=database)                                 │
                └───────────────────────────────────────────────────────┘
```

> Si en el futuro se hicieran peticiones **desde el servidor de Next.js** (Server Components), esas sí se ejecutarían dentro del contenedor y deberían usar `http://backend:3000`, con una variable **sin** `NEXT_PUBLIC_` (por ejemplo `API_URL`).

El archivo `../compose.yaml` levanta los tres servicios. Ver `../README.md`.

---

## 9. Detener y limpiar

```bash
docker stop docker-frontend
docker rm docker-frontend
docker rmi docker-frontend
```
