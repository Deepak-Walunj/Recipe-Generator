require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

module.exports = {
    APP_NAME: process.env.APP_NAME || 'Express Backend',
  	ENV: process.env.NODE_ENV || 'development',
  	DEBUG: process.env.DEBUG === 'true',

    SQL_HOST: process.env.SQL_HOST || 'localhost',
	SQL_USER: process.env.SQL_USER || 'root',
	SQL_PASSWORD: process.env.SQL_PASSWORD,
	SQL_DATABASE: process.env.SQL_DATABASE,
	SQL_PORT: process.env.SQL_PORT || 3306,

    SECRET_KEY: process.env.SECRET_KEY,
    ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '30'),
  	REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7'),
  	ALGORITHM: process.env.ALGORITHM || 'HS256',
	USE_DOCKER_REDIS: process.env.USE_DOCKER_REDIS === 'true',
	CACHE: process.env.CACHE === 'true',

    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    PORT: process.env.PORT || 5000,

	LOG_LEVEL: process.env.LOG_LEVEL, 
	LOG_FORMAT: process.env.LOG_FORMAT, 
	ENABLE_CONSOLE_LOGGING: process.env.ENABLE_CONSOLE_LOGGING === 'true',
	ENABLE_FILE_LOGGING: process.env.ENABLE_FILE_LOGGING === 'true',
	LOG_FILE_PATH: process.env.LOG_FILE_PATH,

	ELASTIC_APM_ENABLED: process.env.ELASTIC_APM_ENABLED === 'true',
	ELASTIC_APM_SERVER_URL: process.env.ELASTIC_APM_SERVER_URL, 
	ELASTIC_APM_SERVICE_NAME: process.env.ELASTIC_APM_SERVICE_NAME,
	ELASTIC_APM_ENVIRONMENT: process.env.ELASTIC_APM_ENVIRONMENT,
}