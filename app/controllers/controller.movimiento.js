import pool from '../config/db.js';

const parseId = (valor) => {
    const id = Number.parseInt(valor, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const aEnteroPositivo = (valor) => {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
};

const validarMovimiento = (body) => {
    const { producto_id, tipo, cantidad } = body;

    const productoId = parseId(producto_id);
    if (!productoId) return 'producto_id debe ser un entero positivo';

    if (tipo !== 'entrada' && tipo !== 'salida') {
        return "tipo debe ser 'entrada' o 'salida'";
    }

    const cantidadValida = aEnteroPositivo(cantidad);
    if (cantidadValida === null) return 'cantidad debe ser un entero mayor a 0';

    if (body.motivo !== undefined && body.motivo !== null && String(body.motivo).trim().length > 200) {
        return 'motivo no puede exceder 200 caracteres';
    }

    return null;
};

export const registrarMovimiento = async (req, res) => {

    const errorValidacion = validarMovimiento(req.body);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    const productoId = parseId(req.body.producto_id);
    const tipo = req.body.tipo;
    const cantidad = aEnteroPositivo(req.body.cantidad);
    const motivo = req.body.motivo ? String(req.body.motivo).trim() : null;

    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();

        const [filas] = await conexion.query(
            'SELECT id, nombre, stock FROM productos WHERE id = ? FOR UPDATE',
            [productoId]
        );

        if (filas.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const producto = filas[0];
        const stockActual = Number(producto.stock);

        if (tipo === 'salida' && cantidad > stockActual) {
            await conexion.rollback();
            return res.status(409).json({
                error: `Stock insuficiente para una salida de ${cantidad} unidades (stock actual: ${stockActual})`
            });
        }

        const stockDespues = tipo === 'entrada' ? stockActual + cantidad : stockActual - cantidad;

        await conexion.query(
            'UPDATE productos SET stock = ? WHERE id = ?',
            [stockDespues, productoId]
        );

        const [resultado] = await conexion.query(
            `INSERT INTO movimientos (producto_id, tipo, cantidad, stock_despues, motivo)
             VALUES (?, ?, ?, ?, ?)`,
            [productoId, tipo, cantidad, stockDespues, motivo]
        );

        await conexion.commit();

        res.status(201).json({
            id: resultado.insertId,
            producto_id: productoId,
            producto_nombre: producto.nombre,
            tipo,
            cantidad,
            stock_anterior: stockActual,
            stock_despues: stockDespues,
            motivo
        });

    } catch (error) {
        await conexion.rollback();
        console.error('Error en movimiento:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'producto_id no existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        conexion.release();
    }

};

export const listarMovimientos = async (req, res) => {

    try {

        const [rows] = await pool.query(
            `SELECT mv.*, p.nombre AS producto_nombre, p.codigo_barras
             FROM movimientos mv
             LEFT JOIN productos p ON p.id = mv.producto_id
             ORDER BY mv.id DESC
             LIMIT 100`
        );

        res.json(rows);

    } catch (error) {

        console.error('Error al listar movimientos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });

    }

};
