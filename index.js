import express from 'express';
import routeAuth from './app/routes/routes.auth.js';
import routeUsuario from './app/routes/routes.usuario.js';

const app = express();

// Middleware
app.use(express.json());

// Puerto (Railway usa process.env.PORT)
const PORT = process.env.PORT || 3000;

// Rutas
app.use('/api', routeAuth);
app.use('/api', routeUsuario);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Back end API funcionando correctamente'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en ${PORT}`);
});