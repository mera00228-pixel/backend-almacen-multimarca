import pool from '../config/db.js';

// Listar productos
export const listarProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener producto por ID
export const obtenerProducto = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM productos WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Crear producto
export const crearProducto = async (req, res) => {

    try {

        const { nombre, marca, precio, stock } = req.body;

        const [result] = await pool.query(
            'INSERT INTO productos(nombre,marca,precio,stock) VALUES (?,?,?,?)',
            [nombre, marca, precio, stock]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// Actualizar producto
export const actualizarProducto = async (req, res) => {

    try {

        const { id } = req.params;
        const { nombre, marca, precio, stock } = req.body;

        const [result] = await pool.query(
            `UPDATE productos
             SET nombre=?, marca=?, precio=?, stock=?
             WHERE id=?`,
            [nombre, marca, precio, stock, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// Eliminar producto
export const eliminarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM productos WHERE id=?',
            [id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });

        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};