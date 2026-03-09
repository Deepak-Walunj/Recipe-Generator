const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../core/settings');
const { setupLogging, getLogger } = require('../core/logger')
const { getAuthService } = require('../core/deps');
const { MissingRequiredFields, ValidationError } = require('../core/exception')
const { LoginEntitySchema } = require('../schemas/authSchema');
const { TokenResponse, TokenData } = require('../schemas/authSchema');

setupLogging();
const logger = getLogger("auth-router");

router.post('/login', async (req, res, next) => {
    const authService = getAuthService()
    const { error, value } = LoginEntitySchema.validate(req.body)
    if (error){
        return next(new MissingRequiredFields(error.message, 400, 'MISSING_FIELDS', error.details));
    }
    const user = await authService.loginEntity(value)
    const {access_token, refresh_token} = await authService.generateTokens(user)
    res.cookie('refresh_token', refresh_token,{
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    logger.info(`User ${user.user_id} logged in as ${value.entity_type}`);
    return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token)));
});

router.post("/refresh", async (req, res, next) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken){
        return next(new MissingRequiredFields("Refresh token is required in cookies", 400, 'MISSING_FIELDS', [{message: "Refresh token is required in cookies", field: "refresh_token"}]));
    }
    try{
        const payload = jwt.verify(refreshToken, SECRET_KEY);
        if (payload.type !== "refresh"){
            return next(new ValidationError("Invalid token type", 401, 'INVALID_TOKEN_TYPE'));
        }
        const access_token = create_access_token({
            userId: payload.userId,
            email: payload.email,
            entity_type: payload.entity_type
        });
        return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token)));
    }catch(err){
        return next(new ValidationError("Invalid refresh token type", 401, 'INVALID_TOKEN_TYPE'));
    }
});

module.exports = router;