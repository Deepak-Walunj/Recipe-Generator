const express = require('express');
const router = express.Router();
const { setupLogging, getLogger } = require('../core/logger')
const { getAuthService } = require('../core/deps');
const { MissingRequiredFields, UnauthorizedError } = require('../core/exception')
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
    if(!user) {
        return next(new UnauthorizedError('Incorrect email or password', 401, 'UNAUTHORIZED', value.email));
    }
    const {access_token, refresh_token} = await authService.generateTokens(user)
    res.cookie('refresh_token', refresh_token,{
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token)));
});

module.exports = router;