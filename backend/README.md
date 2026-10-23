# Backend — NestJS 11.2.3 + PostgreSQL 16

API REST de `docker_tienda` para la clase de Docker.

```
Next.js  (frontend)
   ↓  HTTP (REST)
NestJS   (este backend)
   ↓  TypeORM + pg
PostgreSQL 16  (database/)
```

## Estructura

```
backend/
├── Dockerfile
├── .dockerignore
├── .env.example
├── docker-tienda.postman_collection.json
├── package.json / pnpm-lock.yaml
└── src/
    ├── main.ts               -> arranque: CORS, validación, escucha en 0.0.0.0:3000
    ├── app.module.ts         -> ConfigModule + TypeORM (PostgreSQL)
    ├── app.controller.ts     -> GET /health
    ├── categories/
    │   ├── categories.controller.ts
    │   ├── categories.service.ts
    │   ├── categories.module.ts
    │   ├── entities/category.entity.ts
    │   └── dto/create-category.dto.ts, update-category.dto.ts
    └── products/
        ├── products.controller.ts
        ├── products.service.ts
        ├── products.module.ts
        ├── entities/product.entity.ts
        └── dto/create-product.dto.ts, update-product.dto.ts
```

### Versiones fijas

Las versiones están fijadas **exactamente** en `package.json` (sin `^`) y en `pnpm-lock.yaml`, para que todos los estudiantes instalen lo mismo:

| Paquete | Versión |
|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | **11.2.3** |
| `@nestjs/typeorm` | 11.0.3 |
| `@nestjs/config` | 4.0.4 |
| `typeorm` | 0.3.31 |
| `pg` | 8.23.1 |
| `class-validator` / `class-transformer` | 0.14.4 / 0.5.1 |

> ⚠️ No ejecutes `pnpm update` ni `pnpm add @nestjs/...@latest`: instalaría NestJS 12.

---

## 1. Variables de entorno

Copia el ejemplo:

```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=docker_tienda
PORT=3000
```

El código **no** tiene la contraseña ni el host escritos: los lee de variables de entorno. Así la misma imagen funciona en tu PC, en Docker o en un servidor, cambiando solo las variables.

### ¿`localhost` o `database`?

`DB_HOST` depende de **dónde se ejecuta NestJS**:

| NestJS se ejecuta en... | `DB_HOST` | Por qué |
|---|---|---|
| Tu PC (`pnpm start:dev`) | `localhost` | PostgreSQL publica el puerto 5432 en tu PC con `-p 5432:5432`. |
| Un contenedor Docker (red Docker / Docker Compose) | `database` | Dentro de un contenedor, `localhost` es **el propio contenedor**, no tu PC. Los contenedores se encuentran por su **nombre de servicio** en la red Docker. |

Más adelante, en Docker Compose, el servicio de PostgreSQL se llamará `database`, y por eso `DB_HOST=database`.

---

## 2. TypeORM y las tablas existentes

Las tablas `categories` y `products` las crea **`init.sql`** en el contenedor de PostgreSQL. Las entidades de NestJS solo **describen** esas tablas:

- `CategoryEntity` → tabla `categories` (`@OneToMany` con productos).
- `ProductEntity` → tabla `products` (`@ManyToOne` con categoría). La columna `category_id` de la tabla se expone en la API como `categoryId`.

En `app.module.ts` se usa `synchronize: false`: TypeORM **no** crea ni modifica tablas. La base de datos es responsabilidad del contenedor de PostgreSQL.

---

## 3. Ejecutar sin Docker (desarrollo)

Requiere Node 22 y pnpm, y el contenedor `docker-postgres` corriendo (ver `../README.md`).

```bash
pnpm install
pnpm start:dev
```

Prueba: <http://localhost:3000/health>

---

## 4. Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API |
| GET | `/categories` | Lista categorías |
| GET | `/categories/:id` | Una categoría con sus productos |
| POST | `/categories` | Crea una categoría |
| PATCH | `/categories/:id` | Actualiza una categoría |
| DELETE | `/categories/:id` | Elimina una categoría (409 si tiene productos) |
| GET | `/products` | Lista productos **con su categoría** |
| GET | `/products/:id` | Un producto con su categoría |
| POST | `/products` | Crea un producto |
| PATCH | `/products/:id` | Actualiza un producto |
| DELETE | `/products/:id` | Elimina un producto |

---

## 5. Ejemplos para Postman

Importa `docker-tienda.postman_collection.json` en Postman (**Import → File**). Usa la variable `{{baseUrl}}` = `http://localhost:3000`.

En las peticiones con body: **Body → raw → JSON**.

### GET /health

```json
{ "status": "ok" }
```

### GET /categories

```json
[
  { "id": 1, "name": "Tecnología", "description": "Equipos y dispositivos tecnológicos" },
  { "id": 2, "name": "Accesorios", "description": "Accesorios para computadoras y dispositivos" },
  { "id": 3, "name": "Periféricos", "description": "Dispositivos de entrada y salida" }
]
```

### POST /categories

Body:

```json
{
  "name": "Almacenamiento",
  "description": "Discos duros, SSD y memorias USB"
}
```

Respuesta `201`:

```json
{ "id": 4, "name": "Almacenamiento", "description": "Discos duros, SSD y memorias USB" }
```

Si el nombre ya existe → `409 Conflict`.

### GET /products

```json
[
  {
    "id": 1,
    "name": "Teclado mecánico",
    "description": "Teclado mecánico con switches azules",
    "price": 189.9,
    "stock": 25,
    "categoryId": 3,
    "category": { "id": 3, "name": "Periféricos", "description": "Dispositivos de entrada y salida" }
  }
]
```

### GET /products/1

Devuelve un solo producto con el mismo formato. Si no existe → `404 Not Found`.

### POST /products

Body:

```json
{
  "name": "Parlantes Bluetooth",
  "description": "Parlantes portátiles con batería de 10 horas",
  "price": 129.9,
  "stock": 15,
  "categoryId": 2
}
```

Respuesta `201`: el producto creado, incluyendo `category`.

Validaciones:

| Campo | Regla |
|---|---|
| `name` | obligatorio, texto, máx. 150 caracteres |
| `description` | opcional, texto |
| `price` | obligatorio, número ≥ 0, máx. 2 decimales |
| `stock` | opcional (por defecto 0), entero ≥ 0 |
| `categoryId` | obligatorio, entero, la categoría debe existir |

Ejemplo de error `400`:

```json
{
  "message": ["name should not be empty", "price must not be less than 0"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### PATCH /products/1

Solo se envían los campos que cambian:

```json
{
  "price": 169.9,
  "stock": 30
}
```

### DELETE /products/11

```json
{ "message": "Producto 11 eliminado" }
```

---

## 6. Ejecutar el backend con Docker

### El Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app

# Activar pnpm
RUN corepack enable

# 1. Instalar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Copiar el código
COPY . .

# 3. Construir NestJS (genera dist/)
RUN pnpm build

# 4. Ejecutar la aplicación
EXPOSE 3000
CMD ["node", "dist/main"]
```

- Se copian primero `package.json` y `pnpm-lock.yaml` para aprovechar la **caché de capas**: si solo cambia el código, Docker no vuelve a instalar dependencias.
- `.dockerignore` evita copiar `node_modules`, `dist` y `.env` a la imagen (las credenciales no deben quedar dentro de la imagen).
- `main.ts` escucha en `0.0.0.0`: si escuchara solo en `localhost`, la API sería inaccesible desde fuera del contenedor.

### Construir y ejecutar

Desde la carpeta `docker-clase/`:

```bash
docker build -t docker-backend ./backend
```

```bash
docker run -d \
  --name docker-backend \
  -p 3000:3000 \
  --env-file backend/.env \
  docker-backend
```

PowerShell (una línea):

```powershell
docker run -d --name docker-backend -p 3000:3000 --env-file backend/.env docker-backend
```

- `--env-file backend/.env` → pasa todas las variables del archivo al contenedor.
- `-p 3000:3000` → publica la API en `http://localhost:3000`.

Ver logs:

```bash
docker logs docker-backend
```

### ⚠️ ¿Por qué falla la conexión a la base de datos?

Si `backend/.env` tiene `DB_HOST=localhost`, verás en los logs errores como `ECONNREFUSED 127.0.0.1:5432`.

**Dentro del contenedor del backend, `localhost` es el propio contenedor del backend**, y ahí no hay ningún PostgreSQL. Cada contenedor está aislado y tiene su propia red. Este error es parte de la lección: los contenedores necesitan estar en una **red Docker** para comunicarse.

---

## 7. Comunicación entre contenedores: redes Docker

Una **red Docker** permite que los contenedores se comuniquen usando **nombres** en lugar de IPs. Docker incluye un DNS interno: en la red, el nombre `database` apunta al contenedor de PostgreSQL.

```
┌──────────────── red: tienda-net ────────────────┐
│                                                 │
│  docker-backend  ───── database:5432 ─────▶  docker-postgres
│  (NestJS :3000)                              (alias: database)
│                                                 │
└─────────────────────────────────────────────────┘
        ▲
        │ -p 3000:3000
     Tu PC / Postman
```

Pasos (desde `docker-clase/`):

```bash
# 1. Crear la red
docker network create tienda-net

# 2. Levantar PostgreSQL en la red, con el alias "database"
docker rm -f docker-postgres
docker run -d --name docker-postgres --network tienda-net --network-alias database -e POSTGRES_DB=docker_tienda -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v postgres_data:/var/lib/postgresql/data docker-postgres

# 3. Levantar el backend en la misma red, cambiando solo DB_HOST
docker rm -f docker-backend
docker run -d --name docker-backend --network tienda-net -p 3000:3000 --env-file backend/.env -e DB_HOST=database docker-backend
```

`-e DB_HOST=database` sobrescribe el valor del `.env` sin tener que editar el archivo.

Comprobar:

```bash
docker network inspect tienda-net
docker logs docker-backend
curl http://localhost:3000/products
```

Esto es exactamente lo que **Docker Compose** hará automáticamente más adelante: crear la red, conectar los servicios y resolver el nombre `database`.

---

## 8. Detener y limpiar

```bash
docker stop docker-backend
docker rm docker-backend
docker rmi docker-backend
docker network rm tienda-net
```
