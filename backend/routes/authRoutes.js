const express = require('express');
const router = express.Router();
const { SECURE } = require('../core/settings');
const { setupLogging, getLogger } = require('../core/logger')
const { getAuthService } = require('../core/deps');
const { MissingRequiredFields, ValidationError } = require('../core/exception')
const { LoginEntitySchema, TokenResponse, TokenData } = require('../schemas/authSchema');
const { verify_refresh_token } = require('../middleware/authMiddleware')
const { create_access_token } = require('../middleware/security');


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
    // if the front end is hosted on a different host/port (different "site")
    // the browser will not send a lax cookie on XHR/fetch.  use `none` when
    // we expect cross‑site requests.  `secure` must be true when sameSite is
    // none, so in development we fall back to lax to avoid requiring https.
    const cookieOpts = {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('refresh_token', refresh_token, cookieOpts);
    logger.info(`User ${user.user_id} logged in as ${value.entity_type}`);
    return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token, refresh_token)));
});

router.post("/refresh", async (req, res, next) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken){
        return next(new MissingRequiredFields("Refresh token is required in cookies", 400, 'MISSING_FIELDS', [{message: "Refresh token is required in cookies", field: "refresh_token"}]));
    }
    try{
        const payload = await verify_refresh_token(refreshToken)
        const access_token = create_access_token({
            userId: payload.userId,
            email: payload.email,
            entity_type: payload.entity_type
        });
        return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token)));
    }catch(err){
        return next(new ValidationError("Invalid refresh token type", 401, 'INVALID_TOKEN_TYPE', {error: err.message}));
    }
});

module.exports = router;