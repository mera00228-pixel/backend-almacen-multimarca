import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta_123';

export const login = (req, res) => {

    const { usuario, contraseña } = req.body;

    if (usuario !== 'admin' || contraseña !== '1234') {

        return res.status(401).json({
            error: 'Credenciales incorrectas'
        });

    }

    const token = jwt.sign(
        { usuario },
        SECRET,
        { expiresIn: '2h' }
    );

    res.json({ token });

};