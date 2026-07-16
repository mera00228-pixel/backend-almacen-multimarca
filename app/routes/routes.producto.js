import { Router } from 'express';

import {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/controller.producto.js';

import { verificarToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/productos', verificarToken, listarProductos);

router.get('/productos/:id', verificarToken, obtenerProducto);

router.post('/productos', verificarToken, crearProducto);

router.put('/productos/:id', verificarToken, actualizarProducto);

router.delete('/productos/:id', verificarToken, eliminarProducto);

export default router;