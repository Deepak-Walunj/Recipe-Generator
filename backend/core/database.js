const mysql = require('mysql2/promise');
const { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_PORT } = require('./settings');
const { initializeCollections, checkCollectionHealth } = require('./database_init');
const { setupLogging, getLogger } = require('./logger');

let client
let db
setupLogging();
const logger = getLogger("database");
logger.info('In database.js');

async function connectDB(){
    try{
        pool = mysql.createPool({
            host: SQL_HOST,
            user: SQL_USER,
            password: SQL_PASSWORD,
            database: SQL_DATABASE,
            port: SQL_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
        const connection = await pool.getConnection();
        connection.ping();
        connection.release();
        db = pool;

        await initializeCollections(db)
        if (!(await checkCollectionHealth(db))){
            logger.error('Database health check failed');
        }
        logger.info(`Connected to SQL: ${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE}`);
    }catch(err){
        disconnectDB()
        logger.error(`DB connection failed ${err}`)
    }
}

async function disconnectDB() {
    if (client) {
        client.close();
        client = null;
        db = null;
        logger.info('Disconnected from MongoDB');
    }
}

function getDB() {
    if (!db) logger.error('Database not connected');
    return db;
}

module.exports = { connectDB, disconnectDB, getDB };