import { Router } from 'express';
import { registrarMovimiento, listarMovimientos } from '../controllers/controller.movimiento.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/movimientos', verificarToken, registrarMovimiento);

router.get('/movimientos', verificarToken, listarMovimientos);

export default router;
