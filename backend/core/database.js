import mysql from 'mysql2/promise';
import { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_PORT } from './settings.js';
import { initializeCollections, checkCollectionHealth } from './database_init.js';
import { setupLogging, getLogger } from './logger.js';

let client
let db
setupLogging();
const logger = getLogger("database");
logger.info('In database.js');

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 2000;

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function connectDB(retryCount = 0){
    try{
        logger.info(`Attempting MySQL connection (attempt ${retryCount + 1}) to ${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE} as ${SQL_USER}`);
        const pool = mysql.createPool({
            host: SQL_HOST,
            user: SQL_USER,
            password: SQL_PASSWORD,
            database: SQL_DATABASE,
            port: SQL_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: {
                rejectUnauthorized: false
            }
        })
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        db = pool;

        await initializeCollections(db)
        if (!(await checkCollectionHealth(db))){
            logger.error('Database health check failed');
        }
        logger.info(`Connected to SQL: ${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE}`);
    }catch(err){
        logger.error(`DB connection failed ${err}`)
        disconnectDB()
        if (retryCount < MAX_RETRIES){
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
            logger.warn(`Retrying MySQL connection in ${delay} ms`);
            await sleep(delay)
            return connectDB(retryCount + 1);
        }
        logger.error('Max MySQL retry attempts reached. Giving up.');
    }
}

async function disconnectDB() {
    if (db) {
        await db.end();
        client = null;
        db = null;
        logger.info('Disconnected from MySQL');
    }
}

function getDB() {
    if (!db) logger.error('Database not connected');
    return db;
}

export {connectDB, disconnectDB, getDB};