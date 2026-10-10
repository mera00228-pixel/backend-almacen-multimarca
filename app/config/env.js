import 'dotenv/config';

const pick = (...claves) =>
    claves
        .map((clave) => process.env[clave])
        .find((valor) => valor !== undefined && valor !== '');

// Railway entrega una cadena única de conexión (DATABASE_URL o MYSQL_URL).
// Si existe, tiene prioridad; si no, se usan las variables individuales.
const urlConexion = pick('DATABASE_URL', 'MYSQL_URL');

let desdeUrl = null;
if (urlConexion) {
    try {
        const url = new URL(urlConexion);
        desdeUrl = {
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, '')
        };
    } catch {
        console.warn('DATABASE_URL/MYSQL_URL no se pudo parsear, se usarán variables individuales');
    }
}

export const PORT = Number(process.env.PORT) || 3000;

// Puede ser una o varias URLs separadas por coma (para CORS)
export const CLIENT_URL = process.env.CLIENT_URL || '*';

export const DB_HOST = desdeUrl?.host ?? pick('DB_HOST', 'MYSQLHOST') ?? 'localhost';
export const DB_PORT = desdeUrl?.port ?? Number(pick('DB_PORT', 'MYSQLPORT') ?? 3306);
export const DB_USER = desdeUrl?.user ?? pick('DB_USER', 'MYSQLUSER') ?? 'root';
export const DB_PASSWORD = desdeUrl?.password ?? process.env.DB_PASSWORD ?? process.env.MYSQLPASSWORD ?? '';
export const DB_NAME = desdeUrl?.database ?? pick('DB_NAME', 'MYSQLDATABASE', 'MYSQL_DATABASE') ?? 'almacen_multimarca';

// Activa SSL para MySQL gestionado en la nube solo si se indica (DB_SSL=true)
export const DB_SSL = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

export const JWT_SECRET = process.env.JWT_SECRET;

const requeridasFaltantes = [];
if (!JWT_SECRET) requeridasFaltantes.push('JWT_SECRET');

if (requeridasFaltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${requeridasFaltantes.join(', ')}`);
}
