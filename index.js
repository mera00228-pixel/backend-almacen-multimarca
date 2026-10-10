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

// Health check (útil para Railway/Render y monitoreo)
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'up' });
    } catch {
        res.status(503).json({ status: 'error', db: 'down' });
    }
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
});
