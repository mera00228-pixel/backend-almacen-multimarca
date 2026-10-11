-- ============================================================
-- Almacén Multimarca - Esquema completo (rico)
-- ============================================================
CREATE DATABASE IF NOT EXISTS almacen_multimarca
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE almacen_multimarca;

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- Usuarios (autenticación JWT)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Marcas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT DEFAULT NULL,
  estado TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT DEFAULT NULL,
  estado TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Productos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  imagen_url VARCHAR(500) DEFAULT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  marca_id INT DEFAULT NULL,
  categoria_id INT DEFAULT NULL,
  estado TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_marca FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- ============================================================
-- Datos semilla
-- ============================================================

-- Usuario por defecto: admin / 1234  (CAMBIAR EN PRODUCCIÓN)
INSERT INTO usuarios (usuario, password_hash) VALUES
  ('admin', '$2a$10$2x/3XrVS9U/zqRZ3nXMuA.1LAJQxyA8ed6desMhozkH5JU2CTP/Wa')
ON DUPLICATE KEY UPDATE usuario = usuario;

INSERT INTO marcas (id, nombre, descripcion) VALUES
  (1, 'Nike', 'Calzado y ropa deportiva global'),
  (2, 'Adidas', 'Ropa, calzado y accesorios deportivos'),
  (3, 'Sony', 'Electrónica de consumo y entretenimiento'),
  (4, 'Samsung', 'Tecnología y electrodomésticos'),
  (5, 'Levis', 'Ropa y mezclilla tradicional')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO categorias (id, nombre, descripcion) VALUES
  (1, 'Calzado', 'Zapatos, zapatillas y sandalias para diferentes ocasiones'),
  (2, 'Ropa', 'Prendas de vestir para hombres y mujeres'),
  (3, 'Electrónica', 'Dispositivos tecnológicos, audio y video'),
  (4, 'Accesorios', 'Complementos, gorras, cinturones y otros'),
  (5, 'Línea Blanca', 'Electrodomésticos grandes para el hogar')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO productos
  (codigo_barras, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, marca_id, categoria_id, estado)
VALUES
  ('750100100101', 'Zapatillas Air Max', 'Calzado deportivo para correr con amortiguación de aire', 80.00, 130.00, 25, 5, 1, 1, 1),
  ('750100100102', 'Camiseta Deportiva Dri-Fit', 'Camiseta transpirable para entrenamientos intensos', 15.00, 35.00, 50, 10, 1, 2, 1),
  ('750100100201', 'Zapatillas Ultraboost', 'Tenis de running de alta gama con suela acolchada', 90.00, 150.00, 20, 4, 2, 1, 1),
  ('750100100202', 'Sudadera con Capucha Essentials', 'Sudadera casual de algodón y poliéster', 30.00, 65.00, 35, 8, 2, 2, 1),
  ('750100100301', 'Audífonos Inalámbricos WH-1000XM5', 'Audífonos de diadema con cancelación de ruido líder en la industria', 220.00, 350.00, 12, 3, 3, 3, 1),
  ('750100100302', 'Barra de Sonido Dolby Atmos', 'Sistema de audio envolvente para televisión', 180.00, 280.00, 8, 2, 3, 3, 1),
  ('750100100401', 'Smart TV Crystal UHD 55"', 'Televisor inteligente 4K con tecnología PurColor', 350.00, 520.00, 10, 2, 4, 3, 1),
  ('750100100402', 'Microondas Bespoke 28L', 'Horno microondas con diseño moderno y grill', 110.00, 185.00, 15, 3, 4, 5, 1),
  ('750100100501', 'Pantalón de Mezclilla 501 Original', 'Jeans clásicos de corte recto para caballero', 35.00, 75.00, 40, 10, 5, 2, 1),
  ('750100100502', 'Cinturón de Cuero Reversible', 'Cinturón formal de piel genuina con hebilla metálica', 18.00, 40.00, 30, 6, 5, 4, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
