import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            error: 'Token no proporcionado'
        });

    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        req.usuario = decoded;

        next();

    } catch {

        return res.status(401).json({
            error: 'Token inválido o expirado'
        });

    }

};