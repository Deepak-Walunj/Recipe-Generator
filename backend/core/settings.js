import dotenv from "dotenv";
dotenv.config();

export const APP_NAME = process.env.APP_NAME || 'Express Backend';
export const ENV = process.env.NODE_ENV || 'development';
export const DEBUG = process.env.DEBUG === 'true';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const SQL_HOST = process.env.SQL_HOST;
export const SQL_USER = process.env.SQL_USER;
export const SQL_PASSWORD = process.env.SQL_PASSWORD;
export const SQL_DATABASE = process.env.SQL_DATABASE;
export const SQL_PORT = process.env.SQL_PORT;

export const SECRET_KEY = process.env.SECRET_KEY;
export const ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '30');
export const REFRESH_TOKEN_EXPIRE_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7');
export const ALGORITHM = process.env.ALGORITHM || 'HS256';
export const SECURE = process.env.NODE_ENV === "production";

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.7:5173'];
export const PORT = process.env.PORT || 5000;

export const LOG_LEVEL = process.env.LOG_LEVEL;
export const LOG_FORMAT = process.env.LOG_FORMAT;
export const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING === 'true';
export const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING === 'true';
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH;


export const ELASTIC_APM_ENABLED = process.env.ELASTIC_APM_ENABLED === 'true';
export const ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL;
export const ELASTIC_APM_SERVICE_NAME = process.env.ELASTIC_APM_SERVICE_NAME;
export const ELASTIC_APM_ENVIRONMENT = process.env.ELASTIC_APM_ENVIRONMENT;

export const EMAIL_SECRET_KEY = process.env.EMAIL_SECRET_KEY;
export const EMAIL_TOKEN_EXPIRE_IN_MINUTES = parseInt(process.env.EMAIL_TOKEN_EXPIRE_IN_MINUTES || '10');
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL
