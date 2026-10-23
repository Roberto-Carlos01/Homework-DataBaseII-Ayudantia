# Docker + PostgreSQL 16 — docker_tienda

Proyecto de la clase práctica de Docker: tres servicios que se comunican entre sí.

```
frontend (Next.js 16.2.2 :3001)  →  backend (NestJS 11.2.3 :3000)  →  database (PostgreSQL 16 :5432)
```

```
docker-clase/
├── README.md
├── compose.yaml      -> levanta los tres servicios juntos (sección 11)
├── database/
│   ├── Dockerfile    -> receta para construir la imagen
│   ├── init.sql      -> crea las tablas e inserta los datos iniciales
│   └── queries.sql   -> ejercicios SQL para la clase
├── backend/          -> API REST NestJS (ver backend/README.md)
└── frontend/         -> interfaz Next.js (ver frontend/README.md)
```

Orden sugerido de la clase: **database** (este README, secciones 1–10) → **backend** → **frontend** → **Docker Compose** (sección 11).

---

## 1. ¿Qué es PostgreSQL?

PostgreSQL es un **sistema gestor de bases de datos relacional** de código abierto.
Guarda la información en **tablas** (filas y columnas) relacionadas entre sí, y se consulta con **SQL**.

En este proyecto tenemos dos tablas:

```
categories (1) ─────< (N) products
```

| Tabla        | Columnas                                                   |
|--------------|------------------------------------------------------------|
| `categories` | `id`, `name`, `description`                                |
| `products`   | `id`, `name`, `description`, `price`, `stock`, `category_id` |

Una categoría puede tener muchos productos, y cada producto pertenece obligatoriamente a una categoría (`FOREIGN KEY`).

---

## 2. ¿Qué problema resuelve Docker aquí?

Sin Docker, cada estudiante tendría que instalar PostgreSQL en su computadora, configurar usuarios, crear la base de datos y ejecutar los scripts a mano. Cada sistema operativo lo hace distinto y aparecen errores de versión.

Con Docker:

- **Todos usan exactamente PostgreSQL 16**, con la misma configuración.
- No se instala nada en el sistema: todo vive dentro de un **contenedor**.
- La base de datos se crea **automáticamente** con tablas y datos al iniciar.
- Se puede borrar y volver a crear en segundos.

### Conceptos clave

| Concepto       | Qué es                                                                 |
|----------------|------------------------------------------------------------------------|
| **Imagen**     | Plantilla de solo lectura (PostgreSQL 16 + nuestro `init.sql`).       |
| **Contenedor** | Una instancia en ejecución de una imagen.                             |
| **Dockerfile** | Archivo con las instrucciones para construir una imagen.              |
| **Volumen**    | Almacenamiento gestionado por Docker que sobrevive al contenedor.     |

### El Dockerfile

```dockerfile
FROM postgres:16

COPY init.sql /docker-entrypoint-initdb.d/01-init.sql
```

- `FROM postgres:16` → partimos de la imagen oficial de PostgreSQL 16.
- `COPY ...` → copiamos nuestro script a `/docker-entrypoint-initdb.d/`.
  La imagen oficial ejecuta automáticamente los archivos `.sql` de esa carpeta **la primera vez** que arranca (cuando la base de datos aún está vacía).

---

## 3. Construir la imagen

Desde la carpeta `docker-clase/`:

```bash
docker build -t docker-postgres ./database
```

- `-t docker-postgres` → nombre (tag) de la imagen.
- `./database` → carpeta donde está el `Dockerfile`.

Ver las imágenes disponibles:

```bash
docker images
```

---

## 4. Ejecutar el contenedor

```bash
docker run -d \
  --name docker-postgres \
  -e POSTGRES_DB=docker_tienda \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  docker-postgres
```

> **Windows PowerShell:** reemplaza `\` al final de cada línea por el acento grave `` ` ``, o escribe todo en una sola línea:
>
> ```powershell
> docker run -d --name docker-postgres -e POSTGRES_DB=docker_tienda -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 docker-postgres
> ```

| Opción                  | Significado                                                        |
|-------------------------|--------------------------------------------------------------------|
| `-d`                    | Ejecuta el contenedor en segundo plano (*detached*).               |
| `--name docker-postgres`| Nombre del contenedor.                                             |
| `-e VARIABLE=valor`     | **Variables de entorno**: nombre de la BD, usuario y contraseña.   |
| `-p 5432:5432`          | **Puertos**: `puerto_de_tu_PC:puerto_del_contenedor`.              |
| `docker-postgres`       | Imagen que se usará.                                               |

> Si ya tienes PostgreSQL instalado en tu PC, el puerto 5432 estará ocupado. Usa otro puerto de tu PC, por ejemplo `-p 5433:5432`.

---

## 5. Verificar que PostgreSQL está funcionando

Ver los contenedores en ejecución:

```bash
docker ps
```

Ver los logs del contenedor:

```bash
docker logs docker-postgres
```

Busca líneas como:

```
/usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-init.sql
...
database system is ready to accept connections
```

Eso confirma que se ejecutó `init.sql` y que PostgreSQL está listo.
Para seguir los logs en tiempo real: `docker logs -f docker-postgres` (salir con `Ctrl + C`).

---

## 6. Conectarse con psql

`psql` es el cliente de consola de PostgreSQL y ya viene dentro del contenedor. Con `docker exec` ejecutamos un comando **dentro** de un contenedor que está corriendo:

```bash
docker exec -it docker-postgres psql -U postgres -d docker_tienda
```

- `-it` → modo interactivo con terminal.
- `psql -U postgres -d docker_tienda` → conectarse con el usuario `postgres` a la base `docker_tienda`.

Comandos útiles dentro de `psql`:

| Comando        | Qué hace                         |
|----------------|----------------------------------|
| `\dt`          | Lista las tablas                 |
| `\d products`  | Muestra la estructura de la tabla |
| `\q`           | Salir de psql                    |

Prueba:

```sql
SELECT * FROM categories;
SELECT * FROM products;
```

Los ejercicios completos están en [`database/queries.sql`](database/queries.sql).

### Datos de conexión (para NestJS, DBeaver, pgAdmin, etc.)

| Campo      | Valor           |
|------------|-----------------|
| Host       | `localhost`     |
| Puerto     | `5432`          |
| Base       | `docker_tienda` |
| Usuario    | `postgres`      |
| Contraseña | `postgres`      |

---

## 7. Detener el contenedor

```bash
docker stop docker-postgres
```

Volver a iniciarlo:

```bash
docker start docker-postgres
```

Ver todos los contenedores, incluso los detenidos:

```bash
docker ps -a
```

---

## 8. Eliminar el contenedor

```bash
docker stop docker-postgres
docker rm docker-postgres
```

> ⚠️ Si el contenedor **no usa un volumen**, al eliminarlo **se pierden todos los datos** (incluidos los productos que hayas insertado o modificado).

Eliminar también la imagen (opcional):

```bash
docker rmi docker-postgres
```

---

## 9. Usar un volumen para conservar los datos

### ¿Por qué es importante el volumen?

Un contenedor es **temporal**. PostgreSQL guarda sus datos en `/var/lib/postgresql/data`, que por defecto está **dentro** del contenedor. Si eliminas el contenedor, esos datos desaparecen con él.

Un **volumen** es un espacio de almacenamiento que Docker gestiona **fuera** del contenedor. Al montarlo en `/var/lib/postgresql/data`, los datos quedan guardados en el volumen y **sobreviven** aunque el contenedor se borre. Así podemos actualizar, recrear o reemplazar el contenedor sin perder la información: eso es **persistencia**.

### Pasos

Si ya existe un contenedor con el mismo nombre, elimínalo primero:

```bash
docker rm -f docker-postgres
```

Crear el volumen:

```bash
docker volume create postgres_data
```

Ejecutar el contenedor usando el volumen:

```bash
docker run -d \
  --name docker-postgres \
  -e POSTGRES_DB=docker_tienda \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  docker-postgres
```

PowerShell (una línea):

```powershell
docker run -d --name docker-postgres -e POSTGRES_DB=docker_tienda -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v postgres_data:/var/lib/postgresql/data docker-postgres
```

- `-v postgres_data:/var/lib/postgresql/data` → `volumen:ruta_dentro_del_contenedor`.

### Experimento de persistencia

1. Conéctate y agrega una categoría:
   ```bash
   docker exec -it docker-postgres psql -U postgres -d docker_tienda -c "INSERT INTO categories (name) VALUES ('Prueba volumen');"
   ```
2. Elimina el contenedor:
   ```bash
   docker rm -f docker-postgres
   ```
3. Vuelve a crearlo con el **mismo** `docker run ... -v postgres_data:...` de arriba.
4. Consulta:
   ```bash
   docker exec -it docker-postgres psql -U postgres -d docker_tienda -c "SELECT * FROM categories;"
   ```
   La categoría **"Prueba volumen" sigue ahí**. 🎉

Repite el experimento **sin** `-v` y verás que el dato se pierde.

### Nota importante sobre `init.sql`

`init.sql` solo se ejecuta cuando la carpeta de datos está **vacía** (la primera vez). Si el volumen ya tiene datos, PostgreSQL **no** vuelve a ejecutarlo. Para empezar desde cero:

```bash
docker rm -f docker-postgres
docker volume rm postgres_data
```

Comandos útiles de volúmenes:

```bash
docker volume ls
docker volume inspect postgres_data
```

---

## 10. Resumen de comandos

| Comando                                                        | Para qué sirve                    |
|----------------------------------------------------------------|-----------------------------------|
| `docker build -t docker-postgres ./database`                   | Construir la imagen               |
| `docker run -d --name docker-postgres ... docker-postgres`     | Crear y ejecutar el contenedor    |
| `docker ps` / `docker ps -a`                                   | Ver contenedores                  |
| `docker logs docker-postgres`                                  | Ver logs                          |
| `docker exec -it docker-postgres psql -U postgres -d docker_tienda` | Entrar a PostgreSQL          |
| `docker stop docker-postgres` / `docker start docker-postgres` | Detener / iniciar                 |
| `docker rm docker-postgres`                                    | Eliminar el contenedor            |
| `docker volume create postgres_data`                           | Crear un volumen                  |
| `docker volume rm postgres_data`                               | Eliminar un volumen               |

---

## 11. Docker Compose: los tres servicios juntos

Hasta ahora cada contenedor se levantó con su propio `docker run`, creando la red a mano. **Docker Compose** describe toda la arquitectura en un solo archivo, `compose.yaml`, y la levanta con un solo comando.

```
frontend  (Next.js :3001)
   ↓  el navegador llama a http://localhost:3000
backend   (NestJS :3000)
   ↓  el contenedor llama a database:5432
database  (PostgreSQL :5432)
```

Qué hace Compose automáticamente:

- **Construye** las tres imágenes (`build:`).
- **Crea una red** compartida: cada servicio se puede alcanzar por su nombre (`database`, `backend`, `frontend`).
- **Crea el volumen** `postgres_data` para que los datos persistan.
- **Respeta el orden**: el backend espera a que PostgreSQL esté listo (`depends_on` + `healthcheck`).

Variables del backend en `compose.yaml`:

```yaml
DB_HOST: database        # nombre del servicio, NO localhost
DB_PORT: 5432
DB_USERNAME: postgres
DB_PASSWORD: postgres
DB_DATABASE: docker_tienda
```

El frontend recibe `NEXT_PUBLIC_API_URL: http://localhost:3000` como **argumento de build**, porque esa URL la usa el **navegador**, que está fuera de Docker (ver `frontend/README.md`, sección 8).

### Comandos

Antes de empezar, elimina los contenedores creados con `docker run` para liberar los puertos:

```bash
docker rm -f docker-postgres docker-backend docker-frontend
```

Levantar todo (desde `docker-clase/`):

```bash
docker compose up -d --build
```

| Comando | Para qué sirve |
|---|---|
| `docker compose ps` | Ver el estado de los servicios |
| `docker compose logs -f backend` | Ver los logs de un servicio |
| `docker compose exec database psql -U postgres -d docker_tienda` | Entrar a PostgreSQL |
| `docker compose down` | Detener y eliminar contenedores y red (los datos se conservan) |
| `docker compose down -v` | Igual, pero **borra también el volumen** (se vuelve a ejecutar `init.sql`) |

Abre:

- Frontend: <http://localhost:3001>
- Backend: <http://localhost:3000/health>

> Si tienes PostgreSQL instalado en tu PC, el puerto 5432 estará ocupado y `docker compose up` fallará. Cambia en `compose.yaml` el puerto del servicio `database` a `"5433:5432"`. El backend no se ve afectado: dentro de la red de Compose sigue usando `database:5432`.
