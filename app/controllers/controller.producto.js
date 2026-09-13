import pool from '../config/db.js';

export const listarProductos = async (req, res) => {

    try {

        const [rows] = await pool.query(
            'SELECT * FROM productos'
        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const crearProducto = async (req, res) => {

    try {

        const { nombre, marca, precio, stock } = req.body;

        const [result] = await pool.query(
            'INSERT INTO productos(nombre,marca,precio,stock) VALUES (?,?,?,?)',
            [nombre, marca, precio, stock]
        );

        res.status(201).json({
            id: result.insertId,
            nombre,
            marca,
            precio,
            stock
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};