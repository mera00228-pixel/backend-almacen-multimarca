import pool from '../config/db.js';

export const listarProductos=async(req,res)=>{
 const [rows]=await pool.query('SELECT * FROM productos');
 res.json(rows);
};

export const crearProducto=async(req,res)=>{
 const {nombre,marca,precio,stock}=req.body;
 const [r]=await pool.query(
 'INSERT INTO productos(nombre,marca,precio,stock) VALUES(?,?,?,?)',
 [nombre,marca,precio,stock]
 );
 res.status(201).json({id:r.insertId,nombre});
};
