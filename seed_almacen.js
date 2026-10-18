import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './app/config/db.js';
import { diagnosticoEntorno } from './app/config/env.js';

const ROUNDS_BCRYPT = 10;

const USUARIOS = [
    { usuario: 'admin', password: '1234' }
];

const MARCAS = [
    { nombre: 'Nike', descripcion: 'Calzado y ropa deportiva global' },
    { nombre: 'Adidas', descripcion: 'Ropa, calzado y accesorios deportivos' },
    { nombre: 'Puma', descripcion: 'Calzado y ropa deportiva de rendimiento' },
    { nombre: 'Sony', descripcion: 'Electrónica de consumo, audio y video' },
    { nombre: 'Samsung', descripcion: 'Smartphones, TV y electrodomésticos' },
    { nombre: 'Levis', descripcion: 'Mezclilla y ropa casual clásica' },
    { nombre: 'Apple', descripcion: 'Dispositivos móviles y wearables premium' }
];

const CATEGORIAS = [
    { nombre: 'Calzado', descripcion: 'Zapatos, zapatillas y sandalias para diferentes ocasiones' },
    { nombre: 'Ropa', descripcion: 'Prendas de vestir para hombres y mujeres' },
    { nombre: 'Electrónica', descripcion: 'Dispositivos tecnológicos, audio y video' },
    { nombre: 'Accesorios', descripcion: 'Complementos, gorras, cinturones y otros' },
    { nombre: 'Línea Blanca', descripcion: 'Electrodomésticos grandes para el hogar' }
];

const PRODUCTOS = [
    { codigo_barras: '750638100001', nombre: 'Nike Air Zoom Pegasus 41', descripcion: 'Zapatillas de running con amortiguación Air Zoom', imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 320.00, precio_venta: 549.00, stock: 24, stock_minimo: 6, marca: 'Nike', categoria: 'Calzado', estado: 1 },
    { codigo_barras: '750638100002', nombre: 'Nike Camiseta Dri-Fit Legend', descripcion: 'Camiseta transpirable para entrenamiento intensivo', imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 45.00, precio_venta: 89.90, stock: 60, stock_minimo: 10, marca: 'Nike', categoria: 'Ropa', estado: 1 },
    { codigo_barras: '750638100003', nombre: 'Nike Gorra AeroSwift', descripcion: 'Gorra deportiva ligera con ajuste trasero', imagen: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 25.00, precio_venta: 49.90, stock: 4, stock_minimo: 8, marca: 'Nike', categoria: 'Accesorios', estado: 1 },
    { codigo_barras: '750638200001', nombre: 'Adidas Ultraboost Light', descripcion: 'Tenis de running con amortiguación Boost', imagen: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 380.00, precio_venta: 649.00, stock: 18, stock_minimo: 5, marca: 'Adidas', categoria: 'Calzado', estado: 1 },
    { codigo_barras: '750638200002', nombre: 'Adidas Sudadera Tiro 23', descripcion: 'Sudadera con capucha para entrenamiento', imagen: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 95.00, precio_venta: 179.00, stock: 30, stock_minimo: 6, marca: 'Adidas', categoria: 'Ropa', estado: 1 },
    { codigo_barras: '750638200003', nombre: 'Adidas Mochila Classic 3', descripcion: 'Mochila deportiva de 3 compartimentos', imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 60.00, precio_venta: 119.00, stock: 2, stock_minimo: 5, marca: 'Adidas', categoria: 'Accesorios', estado: 1 },
    { codigo_barras: '750638300001', nombre: 'Puma Velocity Nitro 3', descripcion: 'Zapatillas de competición con espuma NITRO', imagen: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 290.00, precio_venta: 499.00, stock: 15, stock_minimo: 5, marca: 'Puma', categoria: 'Calzado', estado: 1 },
    { codigo_barras: '750638300002', nombre: 'Puma Chaqueta Softshell', descripcion: 'Chaqueta impermeable para actividad al aire libre', imagen: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 110.00, precio_venta: 199.00, stock: 0, stock_minimo: 4, marca: 'Puma', categoria: 'Ropa', estado: 0 },
    { codigo_barras: '750638400001', nombre: 'Sony WH-1000XM5', descripcion: 'Audífonos de diadema con cancelación de ruido', imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 780.00, precio_venta: 1199.00, stock: 12, stock_minimo: 3, marca: 'Sony', categoria: 'Electrónica', estado: 1 },
    { codigo_barras: '750638400002', nombre: 'Sony Barra de Sonido HT-S400', descripcion: 'Barra de sonido 2.1 con subwoofer inalámbrico', imagen: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 420.00, precio_venta: 699.00, stock: 7, stock_minimo: 2, marca: 'Sony', categoria: 'Electrónica', estado: 1 },
    { codigo_barras: '750638500001', nombre: 'Samsung Galaxy A55 5G 256GB', descripcion: 'Smartphone con pantalla Super AMOLED de 6.6 pulgadas', imagen: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 950.00, precio_venta: 1499.00, stock: 20, stock_minimo: 4, marca: 'Samsung', categoria: 'Electrónica', estado: 1 },
    { codigo_barras: '750638500002', nombre: 'Samsung Smart TV Crystal UHD 55"', descripcion: 'Televisor 4K inteligente con tecnología PurColor', imagen: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 1100.00, precio_venta: 1599.00, stock: 6, stock_minimo: 2, marca: 'Samsung', categoria: 'Electrónica', estado: 1 },
    { codigo_barras: '750638500003', nombre: 'Samsung Microondas Bespoke 28L', descripcion: 'Microondas con grill y diseño modular', imagen: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 280.00, precio_venta: 449.00, stock: 9, stock_minimo: 3, marca: 'Samsung', categoria: 'Línea Blanca', estado: 1 },
    { codigo_barras: '750638600001', nombre: 'Apple AirPods Pro 2', descripcion: 'Audífonos inalámbricos con cancelación activa de ruido', imagen: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 620.00, precio_venta: 899.00, stock: 14, stock_minimo: 4, marca: 'Apple', categoria: 'Electrónica', estado: 1 },
    { codigo_barras: '750638700001', nombre: "Levi's 501 Original", descripcion: 'Jeans de corte recto en mezclilla clásica', imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&h=400&q=80', precio_compra: 120.00, precio_venta: 229.00, stock: 35, stock_minimo: 8, marca: 'Levis', categoria: 'Ropa', estado: 1 }
];

const DDL = [
    `CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS marcas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT DEFAULT NULL,
        estado TINYINT(1) DEFAULT 1,
        creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT DEFAULT NULL,
        estado TINYINT(1) DEFAULT 1,
        creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS productos (
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
    )`,
    `CREATE TABLE IF NOT EXISTS movimientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        tipo ENUM('entrada','salida') NOT NULL,
        cantidad INT NOT NULL,
        stock_despues INT NOT NULL,
        motivo VARCHAR(200) DEFAULT NULL,
        creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_movimientos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    )`
];

async function prepararEsquema(conn) {
    for (const ddl of DDL) {
        await conn.query(ddl);
    }
    try {
        await conn.query('ALTER TABLE productos ADD COLUMN imagen_url VARCHAR(500) DEFAULT NULL AFTER descripcion');
    } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
    }
}

async function main() {
    console.log('=== Seed Almacén Multimarca ===');
    const diagnostico = diagnosticoEntorno();
    console.log(`Base de datos: ${diagnostico.DB_NAME} @ ${diagnostico.DB_HOST}:${diagnostico.DB_PORT}`);
    console.log(`Fuente de conexión: ${diagnostico.fuenteConexion}`);
    console.log(`SSL: ${diagnostico.DB_SSL ? 'activado' : 'desactivado'}`);
    console.log('');

    const conn = await pool.getConnection();
    try {
        await prepararEsquema(conn);

        await conn.beginTransaction();

        for (const u of USUARIOS) {
            const hash = await bcrypt.hash(u.password, ROUNDS_BCRYPT);
            await conn.query(
                `INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
                [u.usuario, hash]
            );
        }

        for (const m of MARCAS) {
            await conn.query(
                `INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)`,
                [m.nombre, m.descripcion]
            );
        }

        for (const c of CATEGORIAS) {
            await conn.query(
                `INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)`,
                [c.nombre, c.descripcion]
            );
        }

        const [filasMarca] = await conn.query('SELECT id, nombre FROM marcas');
        const [filasCategoria] = await conn.query('SELECT id, nombre FROM categorias');
        const idMarcas = Object.fromEntries(filasMarca.map((f) => [f.nombre, f.id]));
        const idCategorias = Object.fromEntries(filasCategoria.map((f) => [f.nombre, f.id]));

        for (const p of PRODUCTOS) {
            const marcaId = idMarcas[p.marca] ?? null;
            const categoriaId = idCategorias[p.categoria] ?? null;
            if (marcaId === null) throw new Error(`Marca no encontrada: ${p.marca}`);
            if (categoriaId === null) throw new Error(`Categoría no encontrada: ${p.categoria}`);
            await conn.query(
                `INSERT INTO productos
                    (codigo_barras, nombre, descripcion, imagen_url, precio_compra, precio_venta, stock, stock_minimo, marca_id, categoria_id, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    imagen_url = VALUES(imagen_url),
                    precio_compra = VALUES(precio_compra),
                    precio_venta = VALUES(precio_venta),
                    stock = VALUES(stock),
                    stock_minimo = VALUES(stock_minimo),
                    marca_id = VALUES(marca_id),
                    categoria_id = VALUES(categoria_id),
                    estado = VALUES(estado)`,
                [
                    p.codigo_barras, p.nombre, p.descripcion, p.imagen ?? null,
                    p.precio_compra, p.precio_venta,
                    p.stock, p.stock_minimo,
                    marcaId, categoriaId, p.estado
                ]
            );
        }

        await conn.commit();

        const [[contarUsuarios]] = await conn.query('SELECT COUNT(*) AS total FROM usuarios');
        const [[contarMarcas]] = await conn.query('SELECT COUNT(*) AS total FROM marcas');
        const [[contarCategorias]] = await conn.query('SELECT COUNT(*) AS total FROM categorias');
        const [[contarProductos]] = await conn.query('SELECT COUNT(*) AS total FROM productos');
        const [[stockTotal]] = await conn.query('SELECT COALESCE(SUM(stock), 0) AS total FROM productos');

        console.log('Seed completado sin errores.');
        console.log(`  usuarios:    ${contarUsuarios.total}`);
        console.log(`  marcas:      ${contarMarcas.total}`);
        console.log(`  categorias:  ${contarCategorias.total}`);
        console.log(`  productos:   ${contarProductos.total} (stock total: ${stockTotal.total} unidades)`);
        console.log('');
        console.log('Credenciales de acceso: admin / 1234');
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
        await pool.end();
    }
}

main().catch((error) => {
    console.error('Error al ejecutar el seed:', error.message);
    process.exitCode = 1;
});
