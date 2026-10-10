import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';

const ROUNDS = 10;

export const login = async (req, res) => {

    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({
            error: 'usuario y contraseña son obligatorios'
        });
    }

    try {

        const [rows] = await pool.query(
            'SELECT id, usuario, password_hash FROM usuarios WHERE usuario = ?',
            [usuario.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciales incorrectas'
            });
        }

        const coincide = await bcrypt.compare(contraseña, rows[0].password_hash);

        if (!coincide) {
            return res.status(401).json({
                error: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            { id: rows[0].id, usuario: rows[0].usuario },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token });

    } catch (error) {

        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });

    }

};

export const registrar = async (req, res) => {

    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({
            error: 'usuario y contraseña son obligatorios'
        });
    }

    if (contraseña.length < 6) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    try {

        const [existe] = await pool.query(
            'SELECT id FROM usuarios WHERE usuario = ?',
            [usuario.trim()]
        );

        if (existe.length > 0) {
            return res.status(409).json({
                error: 'El usuario ya existe'
            });
        }

        const password_hash = await bcrypt.hash(contraseña, ROUNDS);

        const [result] = await pool.query(
            'INSERT INTO usuarios(usuario, password_hash) VALUES (?,?)',
            [usuario.trim(), password_hash]
        );

        res.status(201).json({
            id: result.insertId,
            usuario: usuario.trim()
        });

    } catch (error) {

        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });

    }

};