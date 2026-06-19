import express from 'express';
import dotenv from 'dotenv';
import routeProductos from './app/routes/routes.producto.js';
import routeAuth from './app/routes/routes.auth.js';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api', routeAuth);
app.use('/api', routeProductos);

app.listen(process.env.PORT, () => {
 console.log(`Servidor en puerto ${process.env.PORT}`);
});
