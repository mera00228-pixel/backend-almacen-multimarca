import { Router } from 'express';
import { login, registrar } from '../controllers/controller.auth.js';

const router = Router();

router.post('/login', login);

router.post('/register', registrar);

export default router;