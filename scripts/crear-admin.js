import bcrypt from 'bcryptjs';
import pool from '../app/config/db.js';

const ROUNDS = 12;

const [usuarioArg, passwordArg] = process.argv.slice(2);

const usuario = (usuarioArg || process.env.ADMIN_USER || 'admin').trim();
const password = passwordArg || process.env.ADMIN_PASSWORD;

if (!usuario || !password) {
    console.error('Uso:');
    console.error('  node scripts/crear-admin.js <usuario> <contraseña>');
    console.error('  o define ADMIN_USER y ADMIN_PASSWORD en el entorno.');
    process.exit(1);
}

if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
}

try {
    const password_hash = await bcrypt.hash(password, ROUNDS);

    const [result] = await pool.query(
        `INSERT INTO usuarios (usuario, password_hash)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [usuario, password_hash]
    );

    const accion = result.affectedRows === 1 ? 'creado' : 'actualizado';
    console.log(`Usuario "${usuario}" ${accion} correctamente.`);
} catch (error) {
    console.error('Error al gestionar el usuario:', error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
