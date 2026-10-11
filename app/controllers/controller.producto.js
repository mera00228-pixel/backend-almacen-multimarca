import pool from '../config/db.js';

const parseId = (valor) => {
    const id = Number.parseInt(valor, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const aEntero = (valor) => {
    const n = Number.parseInt(valor, 10);
    return Number.isInteger(n) ? n : null;
};

const aDecimal = (valor) => {
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
};

const aIdONull = (valor) => {
    if (valor === undefined || valor === null || valor === '') return null;
    return aEntero(valor);
};

// Acepta vacío/null (campo opcional) o una URL http(s) válida de hasta 500 caracteres.
const validarUrl = (valor) => {
    if (valor === undefined || valor === null || valor === '') return true;
    if (typeof valor !== 'string') return false;
    const texto = valor.trim();
    if (texto.length === 0 || texto.length > 500) return false;
    try {
        const url = new URL(texto);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const validarProducto = (body) => {

    const { codigo_barras, nombre, precio_compra, precio_venta, stock } = body;

    if (!codigo_barras || !nombre || precio_compra === undefined || precio_venta === undefined || stock === undefined) {
        return 'codigo_barras, nombre, precio_compra, precio_venta y stock son obligatorios';
    }

    if (typeof codigo_barras !== 'string' || codigo_barras.trim().length === 0) {
        return 'codigo_barras debe ser un texto válido';
    }

    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        return 'nombre debe ser un texto válido';
    }

    if (aDecimal(precio_compra) === null || aDecimal(precio_compra) < 0) {
        return 'precio_compra debe ser un número mayor o igual a 0';
    }

    if (aDecimal(precio_venta) === null || aDecimal(precio_venta) < 0) {
        return 'precio_venta debe ser un número mayor o igual a 0';
    }

    if (aEntero(stock) === null || aEntero(stock) < 0) {
        return 'stock debe ser un entero mayor o igual a 0';
    }

    if (!validarUrl(body.imagen_url)) {
        return 'imagen_url debe ser una URL válida (http o https)';
    }

    return null;

};

const normalizar = (body) => ({
    codigo_barras: String(body.codigo_barras).trim(),
    nombre: String(body.nombre).trim(),
    descripcion: body.descripcion ? String(body.descripcion).trim() : null,
    imagen_url: body.imagen_url ? String(body.imagen_url).trim() : null,
    precio_compra: aDecimal(body.precio_compra),
    precio_venta: aDecimal(body.precio_venta),
    stock: aEntero(body.stock),
    stock_minimo: aEntero(body.stock_minimo) ?? 5,
    marca_id: aIdONull(body.marca_id),
    categoria_id: aIdONull(body.categoria_id),
    estado: body.estado === undefined || body.estado === null || body.estado === '' ? 1 : (Number(body.estado) ? 1 : 0)
});

const responderError = (res, error) => {

    console.error('Error en productos:', error);

    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El código de barras ya existe' });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'marca_id o categoria_id no existen' });
    }

    return res.status(500).json({ error: 'Error interno del servidor' });

};

export const listarProductos = async (req, res) => {

    try {

        const [rows] = await pool.query(
            'SELECT * FROM productos ORDER BY id DESC'
        );

        res.json(rows);

    } catch (error) {

        responderError(res, error);

    }

};

export const obtenerProducto = async (req, res) => {

    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {

        const [rows] = await pool.query(
            'SELECT * FROM productos WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(rows[0]);

    } catch (error) {

        responderError(res, error);

    }

};

export const crearProducto = async (req, res) => {

    const errorValidacion = validarProducto(req.body);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    const p = normalizar(req.body);

    try {

        const [result] = await pool.query(
            `INSERT INTO productos
                (codigo_barras, nombre, descripcion, imagen_url, precio_compra, precio_venta, stock, stock_minimo, marca_id, categoria_id, estado)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [p.codigo_barras, p.nombre, p.descripcion, p.imagen_url, p.precio_compra, p.precio_venta, p.stock, p.stock_minimo, p.marca_id, p.categoria_id, p.estado]
        );

        res.status(201).json({ id: result.insertId, ...p });

    } catch (error) {

        responderError(res, error);

    }

};

export const actualizarProducto = async (req, res) => {

    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    const errorValidacion = validarProducto(req.body);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    const p = normalizar(req.body);

    try {

        const [result] = await pool.query(
            `UPDATE productos SET
                codigo_barras = ?, nombre = ?, descripcion = ?, imagen_url = ?, precio_compra = ?, precio_venta = ?,
                stock = ?, stock_minimo = ?, marca_id = ?, categoria_id = ?, estado = ?
             WHERE id = ?`,
            [p.codigo_barras, p.nombre, p.descripcion, p.imagen_url, p.precio_compra, p.precio_venta, p.stock, p.stock_minimo, p.marca_id, p.categoria_id, p.estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ id, ...p });

    } catch (error) {

        responderError(res, error);

    }

};

export const eliminarProducto = async (req, res) => {

    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {

        const [result] = await pool.query(
            'DELETE FROM productos WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado' });

    } catch (error) {

        responderError(res, error);

    }

};
