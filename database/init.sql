-- ==================================================
-- init.sql
-- Se ejecuta automáticamente la PRIMERA vez que se
-- inicia el contenedor (cuando la carpeta de datos está vacía).
-- ==================================================

-- 1. Tabla categories
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. Tabla products
-- 3. Relación: cada producto pertenece a una categoría (FOREIGN KEY)
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL REFERENCES categories(id)
);

-- 4. Categorías
INSERT INTO categories (name, description) VALUES
    ('Tecnología',  'Equipos y dispositivos tecnológicos'),
    ('Accesorios',  'Accesorios para computadoras y dispositivos'),
    ('Periféricos', 'Dispositivos de entrada y salida');

-- 5. Productos
-- category_id: 1 = Tecnología, 2 = Accesorios, 3 = Periféricos
INSERT INTO products (name, description, price, stock, category_id) VALUES
    ('Teclado mecánico',   'Teclado mecánico con switches azules',          189.90, 25, 3),
    ('Mouse Logitech',     'Mouse inalámbrico Logitech',                     79.90, 40, 3),
    ('Monitor 24"',        'Monitor Full HD de 24 pulgadas',                 599.00, 10, 1),
    ('Audífonos',          'Audífonos over-ear con micrófono',               149.50, 30, 2),
    ('Laptop',             'Laptop con 16 GB de RAM y SSD de 512 GB',       3299.00,  5, 1),
    ('Tablet',             'Tablet de 10 pulgadas',                         1199.00,  8, 1),
    ('Mousepad',           'Mousepad de tela tamaño grande',                  39.90, 60, 2),
    ('Cable HDMI',         'Cable HDMI de 2 metros',                          25.00, 100, 2),
    ('Webcam',             'Cámara web Full HD 1080p',                       219.00, 15, 3),
    ('Impresora',          'Impresora multifuncional a color',               649.00,  0, 3);
