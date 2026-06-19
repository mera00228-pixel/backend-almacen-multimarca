import {Router} from 'express';
import {listarProductos,crearProducto} from '../controllers/controller.producto.js';
import {verificarToken} from '../middleware/auth.middleware.js';

const router=Router();
router.get('/productos',verificarToken,listarProductos);
router.post('/productos',verificarToken,crearProducto);

export default router;
