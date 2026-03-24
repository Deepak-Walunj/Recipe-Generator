const express = require('express');
const router = express.Router();
const { SECURE } = require('../core/settings');
const { setupLogging, getLogger } = require('../core/logger')
const { getAuthService } = require('../core/deps');
const { MissingRequiredFields, ValidationError } = require('../core/exception')
const { LoginEntitySchema, TokenResponse, TokenData } = require('../schemas/authSchema');
const {StandardResponse} = require('../schemas/adminSchema')

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
        const authService = getAuthService()
        const access_token = await authService.validateRefreshTokenAndCreateAccessTokens(refreshToken)
        return res.json(new TokenResponse(true, "Login successful", new TokenData(access_token)));
    }catch(err){
        return next(new ValidationError("Something went wrong", 401, 'INVALID_TOKEN_TYPE', {error: err.message}));
    }
});

router.get("/verify-email", async (req, res, next) => {
    const authService = getAuthService()
    const { token } = req.query
    if (!token) {
        return next(new MissingRequiredFields("Verification token is required", 400, 'MISSING_FIELDS', [{message: "Verification token is required", field: "token"}]));
    }
    try{
        const resp = await authService.verifyEmailByToken(token)
        return res.json(new StandardResponse(true, resp.message, {email: resp.email,entity_type: resp.entity_type, is_verified: resp.already_verified, status: resp.status}))
    } catch (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR',{error: error.details}))
    }
})

router.get("/resend-verification", async (req, res, next) => {
    const authService = getAuthService()
    const { email, entity_type } = req.query
    if (!email) {
        return next(new MissingRequiredFields("Email is required", 400, 'MISSING_FIELDS', [{message: "Email is required", field: "email"}]));
    }
    try{
        const resp = await authService.resendVerificationToken(email, entity_type)
        return res.json(new StandardResponse(true, resp.message, { email_verification_token: resp.email_verification_token, already_verified: resp.already_verified }))
    } catch (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR',{error: error.details}))
    }
})

module.exports = router;