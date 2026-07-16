import express from 'express';
import dotenv from 'dotenv';
import routeAuth from './app/routes/routes.auth.js';
import routeUsuario from './app/routes/routes.usuario.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Puerto para Railway o local
const PORT = process.env.PORT || 3000;

// Ruta principal (probar que el servidor funciona)
app.get('/', (req, res) => {
    res.status(200).json({
        estado: "OK",
        mensaje: "Back end API funcionando correctamente"
    });
});

// Ruta de prueba
app.get('/test', (req, res) => {
    res.status(200).json({
        estado: "OK",
        mensaje: "Ruta de prueba funcionando"
    });
});

// Rutas de la API
app.use('/api', routeAuth);
app.use('/api', routeUsuario);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});