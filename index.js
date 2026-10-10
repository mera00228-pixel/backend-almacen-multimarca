import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PORT, CLIENT_URL, diagnosticoEntorno } from './app/config/env.js';
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log('Configuración detectada:', JSON.stringify(diagnosticoEntorno()));
});
