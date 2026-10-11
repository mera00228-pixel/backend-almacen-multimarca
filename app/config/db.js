import mysql from 'mysql2/promise';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL } from './env.js';

// El pool es perezoso: NO abre conexión al importar, por lo que nunca
// bloquea el arranque del servidor web. La primera conexión ocurre en la
// primera consulta.
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ...(DB_SSL ? { ssl: { rejectUnauthorized: false } } : {})
});

// Un error de conexión no manejado en el pool no debe tumbar el proceso.
pool.on('error', (err) => {
  console.error('Error en el pool de MySQL:', err.code || err.message);
});

export default pool;
