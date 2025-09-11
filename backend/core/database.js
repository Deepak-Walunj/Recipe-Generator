const {MongoClient} = require('mongodb')
const { MONGODB_URL, MONGODB_DB_NAME } = require('./settings');
const { initializeCollections, checkCollectionHealth } = require('./database_init');
const { setupLogging, getLogger } = require('./logger');

let client
let db
setupLogging();
const logger = getLogger("database");
logger.info('In database.js');

async function connectDB(){
    try{
        client = new MongoClient(MONGODB_URL)
        await client.connect();
        db = client.db(MONGODB_DB_NAME);

        await initializeCollections(db)
        if (!(await checkCollectionHealth(db))){
            logger.error('Database health check failed');
        }
        logger.info(`Connected to mongoDb: ${MONGODB_URL}`)
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