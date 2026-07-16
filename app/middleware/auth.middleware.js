import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta_123';

export const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            error: 'Token no proporcionado'
        });

    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, SECRET);

        req.usuario = decoded;

        next();

    } catch {

        return res.status(401).json({
            error: 'Token inválido o expirado'
        });

    }

};