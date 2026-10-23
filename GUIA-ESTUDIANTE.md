# Guía del estudiante: levantar Docker Tienda

## ¿Necesito instalar Node, pnpm o PostgreSQL?

**No.** Ese es el objetivo de Docker. Las versiones exactas ya están dentro de las imágenes:

| Pieza | Versión | ¿Dónde está? |
|---|---|---|
| PostgreSQL | 16 | `database/Dockerfile` → `FROM postgres:16` |
| Node | 22 | `backend/Dockerfile` y `frontend/Dockerfile` → `FROM node:22-alpine` |
| NestJS | 11.2.3 | `backend/package.json` + `pnpm-lock.yaml` |
| Next.js | 16.2.2 | `frontend/package.json` + `pnpm-lock.yaml` |

No importa qué versión de Node o PostgreSQL tengas en tu PC (ni si no tienes ninguna): la aplicación usará **exactamente** las mismas versiones que la del profesor.

**Solo necesitas:** Docker Desktop instalado y abierto.

---

## Pasos

### 1. Comprobar Docker

```powershell
docker --version
docker compose version
```

Si fallan, abre Docker Desktop y espera a que diga *Engine running*.

### 2. Entrar a la carpeta del proyecto

Descomprime el archivo y abre una terminal **dentro** de la carpeta `docker-clase` (la que contiene `compose.yaml`).

```powershell
cd docker-clase
```

### 3. Construir y levantar todo

```powershell
docker compose up -d --build
```

La primera vez tarda varios minutos (descarga imágenes e instala dependencias).

### 4. Verificar

```powershell
docker compose ps
```

Deben aparecer los tres servicios: `database` (healthy), `backend` y `frontend`.

### 5. Probar

- Frontend: <http://localhost:3001>
- Backend: <http://localhost:3000/health> → `{"status":"ok"}`

### 6. Crear un producto y comprobarlo en PostgreSQL

Crea un producto desde <http://localhost:3001/products/new> y luego:

```powershell
docker compose exec database psql -U postgres -d docker_tienda -c "SELECT name, price FROM products;"
```

---

## Entrega

Envía **una captura** donde se vean:

1. La salida de `docker compose ps` con los tres servicios en ejecución.
2. El navegador en <http://localhost:3001/products> mostrando **un producto creado por ti** (con tu nombre en el nombre del producto, por ejemplo: "Teclado de Ana").

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `port is already allocated` en 5432 | Tienes PostgreSQL instalado en tu PC. En `compose.yaml`, servicio `database`, cambia `"5432:5432"` por `"5434:5432"` |
| `port is already allocated` en 3000 o 3001 | Cierra el programa que usa ese puerto (otro proyecto de Node, otro contenedor) |
| `docker: command not found` / no conecta | Docker Desktop no está abierto |
| El frontend dice *No se pudo conectar con el backend* | Revisa `docker compose logs backend` |
| Quiero empezar de cero | `docker compose down -v` y luego `docker compose up -d --build` |

Detener todo al terminar:

```powershell
docker compose down
```
