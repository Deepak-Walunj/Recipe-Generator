import { SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, ACCESS_TOKEN_EXPIRE_MINUTES, 
    EMAIL_SECRET_KEY, EMAIL_TOKEN_EXPIRE_IN_MINUTES } from '../core/settings.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UnauthorizedError } from '../core/exception.js';
import { setupLogging, getLogger } from '../core/logger.js';

setupLogging();
const logger = getLogger('security-middleware');

async function hash_password(password){
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

async function verify_password(plain_password, hashed_password){
    return bcrypt.compare(plain_password, hashed_password);
}

function create_access_token(data){
    const payload = { ...data, type : "access"}
    return jwt.sign(
        payload,
        SECRET_KEY,
        { algorithm: ALGORITHM, expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    )
}

function create_refresh_token(data){
    const payload = { ...data, type : "refresh"}
    return jwt.sign(
        payload,
        SECRET_KEY,
        { algorithm: ALGORITHM, expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d` }
    )
}

async function verify_refresh_token(refresh_token){
    try{
        const payload = jwt.verify(refresh_token, SECRET_KEY);
        logger.info(`[Middleware] payload after refresh token verification : ${JSON.stringify(payload)}`)
        const tokey_type = payload.type;
        if (tokey_type !== 'refresh') {
            logger.warn(`Invalid token type: ${tokey_type}, expected: refresh`);
            throw new UnauthorizedError("Invalid token type", 401, "INVALID_TOKEN_TYPE");
        }
        return payload
    } catch(err) {
        if (err.name === "TokenExpiredError") {
            throw new UnauthorizedError("Token expired", 401, "TOKEN_EXPIRED");
        }
        throw new UnauthorizedError("Invalid token", 401, "INVALID_TOKEN", err.message);
    }
}

function generate_verification_token(data){
    logger.info(`Generating token with data: ${JSON.stringify(data)}`)
    return jwt.sign(
        data,
        EMAIL_SECRET_KEY,
        {expiresIn: `${EMAIL_TOKEN_EXPIRE_IN_MINUTES}m`}
    )
}

function verifyEmail(token) {
    logger.info(`Verifying email with token: ${token}`)
    const decode = jwt.verify(token, EMAIL_SECRET_KEY)
    logger.info(`Decoded email verification token: ${JSON.stringify(decode)}`)
    return decode
    } 

export {hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_verification_token,
    verifyEmail,
    verify_refresh_token};