-- ==================================================
-- queries.sql
-- Ejercicios para practicar SQL en la base docker_tienda.
--
-- Conéctate con:
--   docker exec -it docker-postgres psql -U postgres -d docker_tienda
-- y copia/pega cada consulta.
-- ==================================================


-- ==================================================
-- 1. CONSULTAS BÁSICAS (SELECT)
-- ==================================================

-- 1.1 Todas las categorías
SELECT * FROM categories;

-- 1.2 Todos los productos
SELECT * FROM products;

-- 1.3 Solo algunas columnas
SELECT name, price, stock FROM products;


-- ==================================================
-- 2. FILTROS (WHERE)
-- ==================================================

-- 2.1 Buscar productos por nombre exacto
SELECT * FROM products WHERE name = 'Mouse Logitech';

-- 2.2 Buscar productos cuyo nombre contenga un texto
--     (ILIKE no distingue mayúsculas/minúsculas)
SELECT * FROM products WHERE name ILIKE '%mouse%';

-- 2.3 Productos con stock mayor a 20
SELECT * FROM products WHERE stock > 20;

-- 2.4 Productos con precio mayor a 200
SELECT * FROM products WHERE price > 200;

-- 2.5 Productos sin stock
SELECT * FROM products WHERE stock = 0;


-- ==================================================
-- 3. ORDENAR (ORDER BY)
-- ==================================================

-- 3.1 Productos ordenados por precio (menor a mayor)
SELECT name, price FROM products ORDER BY price ASC;

-- 3.2 Productos ordenados por precio (mayor a menor)
SELECT name, price FROM products ORDER BY price DESC;


-- ==================================================
-- 4. RELACIONES (JOIN)
-- ==================================================

-- 4.1 JOIN entre products y categories
SELECT *
FROM products
JOIN categories ON products.category_id = categories.id;

-- 4.2 Nombre del producto y nombre de su categoría
SELECT p.name AS producto,
       c.name AS categoria
FROM products p
JOIN categories c ON p.category_id = c.id;

-- 4.3 Productos de una categoría específica
SELECT p.name, p.price
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'Periféricos';


-- ==================================================
-- 5. INSERTAR DATOS (INSERT)
-- ==================================================

-- 5.1 Insertar una categoría
INSERT INTO categories (name, description)
VALUES ('Almacenamiento', 'Discos duros, SSD y memorias USB');

-- 5.2 Insertar un producto
--     (usamos una subconsulta para obtener el id de la categoría)
INSERT INTO products (name, description, price, stock, category_id)
VALUES (
    'Memoria USB 64 GB',
    'Memoria USB 3.0 de 64 GB',
    35.00,
    50,
    (SELECT id FROM categories WHERE name = 'Almacenamiento')
);

-- Verificar
SELECT * FROM products WHERE name = 'Memoria USB 64 GB';


-- ==================================================
-- 6. ACTUALIZAR DATOS (UPDATE)
-- ==================================================

-- 6.1 Actualizar un producto (precio y descripción)
UPDATE products
SET price = 169.90,
    description = 'Teclado mecánico RGB con switches azules'
WHERE name = 'Teclado mecánico';

-- 6.2 Actualizar el stock (sumar 10 unidades)
UPDATE products
SET stock = stock + 10
WHERE name = 'Impresora';

-- Verificar
SELECT name, price, stock FROM products
WHERE name IN ('Teclado mecánico', 'Impresora');


-- ==================================================
-- 7. ELIMINAR DATOS (DELETE)
-- ==================================================

-- 7.1 Eliminar un producto
DELETE FROM products WHERE name = 'Memoria USB 64 GB';

-- Verificar
SELECT * FROM products WHERE name = 'Memoria USB 64 GB';

-- Pregunta para la clase:
-- ¿Qué pasa si intentas eliminar una categoría que tiene productos?
-- DELETE FROM categories WHERE name = 'Tecnología';
-- (La FOREIGN KEY lo impide y PostgreSQL muestra un error.)


-- ==================================================
-- 8. FUNCIONES DE AGREGACIÓN
-- ==================================================

-- 8.1 Cantidad total de productos
SELECT COUNT(*) AS total_productos FROM products;

-- 8.2 Precio promedio
SELECT ROUND(AVG(price), 2) AS precio_promedio FROM products;

-- 8.3 Precio más alto
SELECT MAX(price) AS precio_maximo FROM products;

-- 8.4 Precio más bajo
SELECT MIN(price) AS precio_minimo FROM products;


-- ==================================================
-- 9. AGRUPAR (GROUP BY)
-- ==================================================

-- 9.1 Cantidad de productos por categoría
SELECT c.name AS categoria,
       COUNT(p.id) AS cantidad_productos
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY cantidad_productos DESC;

-- 9.2 Stock total y precio promedio por categoría
SELECT c.name AS categoria,
       SUM(p.stock) AS stock_total,
       ROUND(AVG(p.price), 2) AS precio_promedio
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.name;
