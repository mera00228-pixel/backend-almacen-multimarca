import express from 'express';
import dotenv from 'dotenv';
import routeAuth from './app/routes/routes.auth.js';
import routeUsuario from './app/routes/routes.usuario.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Puerto (Railway usa el puerto asignado automáticamente)
const PORT = process.env.PORT || 3000;

// Rutas de la API
app.use('/api', routeAuth);
app.use('/api', routeUsuario);

// Ruta principal
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'Back end API funcionando correctamente'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});