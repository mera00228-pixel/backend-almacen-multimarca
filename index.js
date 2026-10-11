import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PORT, CLIENT_URL } from './app/config/env.js';
import pool from './app/config/db.js';
import routeProducto from './app/routes/routes.producto.js';
import routeAuth from './app/routes/routes.auth.js';

const app = express();

// Detrás del proxy de Railway/Render para que las IPs (rate limit) sean correctas
app.set('trust proxy', 1);

app.use(helmet());

// CORS: admite "*" o una lista separada por comas en CLIENT_URL
const origenesPermitidos = CLIENT_URL.split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.includes('*') || origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
    }
}));

app.use(express.json({ limit: '10kb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Demasiados intentos, intente más tarde' }
});

app.use('/api', authLimiter, routeAuth);
app.use('/api', routeProducto);

const comprobarBD = async () => {
    try {
        await Promise.race([
            pool.query('SELECT 1'),
            new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('timeout')), 2000))
        ]);
        return true;
    } catch {
        return false;
    }
};

// Liveness: responde 200 SIEMPRE que el proceso esté vivo.
// Este es el endpoint que Railway usa como healthcheck (no debe depender de la BD).
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Readiness: comprueba la conexión a la BD (para monitoreo, no lo usa Railway)
app.get('/health/ready', async (req, res) => {
    const db = await comprobarBD();
    res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'error', db: db ? 'up' : 'down' });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend API funcionando correctamente'
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Resumen de configuración (solo variables de entorno, sin depender de exports externos)
const resumenConfig = () => ({
    PORT,
    CLIENT_URL,
    fuenteConexion: process.env.DATABASE_URL
        ? 'DATABASE_URL'
        : (process.env.MYSQL_URL ? 'MYSQL_URL' : 'variables individuales (DB_*)'),
    DB_HOST: process.env.DB_HOST || process.env.MYSQLHOST || '(localhost)',
    DB_NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || '(almacen_multimarca)',
    DB_SSL: process.env.DB_SSL || 'false',
    JWT_SECRET: process.env.JWT_SECRET ? 'definido' : 'FALTANTE'
});

// Timeout genérico: si una promesa tarda más de `ms`, se rechaza.
const conTimeout = (promesa, ms, mensaje) =>
    Promise.race([
        promesa,
        new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms))
    ]);

// Sentencias idempotentes: se ejecutan al arrancar (CREATE TABLE IF NOT EXISTS).
// Nota: marcas y categorias se crean porque productos tiene claves foráneas hacia ellas.
const SENTENCIAS_INICIALIZACION = [
    // Usuarios (autenticación JWT). La columna de contraseña se llama password_hash.
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
    // Productos: misma estructura que usa controller.producto.js / routeProducto.
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
    // Usuario por defecto admin/1234. Nunca sobreescribe un usuario existente.
    `INSERT INTO usuarios (usuario, password_hash)
        VALUES ('admin', '$2a$10$2x/3XrVS9U/zqRZ3nXMuA.1LAJQxyA8ed6desMhozkH5JU2CTP/Wa')
        ON DUPLICATE KEY UPDATE usuario = usuario`
];

// Verifica y crea las tablas necesarias. Usa una conexión dedicada que se
// libera siempre (finally), incluso si la operación se agota por timeout.
const inicializarBD = async () => {
    const conexion = await pool.getConnection();
    try {
        for (const sentencia of SENTENCIAS_INICIALIZACION) {
            await conexion.query(sentencia);
        }

        // Migración idempotente para BD ya existentes: agrega imagen_url si falta.
        const [columnas] = await conexion.query(
            `SELECT COUNT(*) AS total FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'imagen_url'`
        );
        if (columnas[0].total === 0) {
            await conexion.query('ALTER TABLE productos ADD COLUMN imagen_url VARCHAR(500) DEFAULT NULL AFTER descripcion');
            console.log('Migración: columna imagen_url agregada a productos');
        }
    } finally {
        conexion.release();
    }
};

// Arranque: primero intenta preparar la BD (con límite de tiempo) y luego,
// pase lo que pase, levanta el servidor web para no quedar en 502.
const arrancar = async () => {
    try {
        await conTimeout(inicializarBD(), 15000, 'La inicialización de la BD superó el tiempo de espera');
        console.log('Inicialización de BD: tablas verificadas/creadas correctamente');
    } catch (error) {
        console.error('Inicialización de BD: no se pudieron verificar/crear las tablas ->', error.code || error.message);
        console.error('El servidor arrancará de todos modos; /health seguirá respondiendo.');
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
        console.log('Configuración detectada:', JSON.stringify(resumenConfig()));

        // Comprobación de BD NO bloqueante: el servidor YA está escuchando.
        comprobarBD().then((ok) => {
            console.log(ok
                ? 'Conexión a MySQL: OK'
                : 'Conexión a MySQL: FALLO (revisa DATABASE_URL / DB_HOST / DB_SSL en Railway)');
        });
    });
};

arrancar();

// Evita que un rechazo/excepción no capturado termine el proceso silenciosamente.
process.on('unhandledRejection', (motivo) => {
    console.error('Promesa rechazada no manejada:', motivo);
});
process.on('uncaughtException', (err) => {
    console.error('Excepción no capturada:', err);
});
