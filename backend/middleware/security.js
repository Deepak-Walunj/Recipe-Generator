const { SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, ACCESS_TOKEN_EXPIRE_MINUTES } = require('../core/settings');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

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

module.exports = {
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
}