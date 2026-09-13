import express from 'express';
import routeUsuario from './app/routes/routes.producto.js';
import routeAuth from './app/routes/routes.auth.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Rutas
app.use('/api', routeAuth);
app.use('/api', routeUsuario);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend API funcionando correctamente'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});