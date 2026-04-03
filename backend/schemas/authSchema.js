import Joi from 'joi';
import { EntityType, AuthProvider } from '../core/enum.js';

const LoginEntitySchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional().allow(null).when("auth_provider", { is: AuthProvider.EMAIL, then: Joi.required(), otherwise: Joi.optional() }),
    entity_type: Joi.string().valid(EntityType.USER, EntityType.ADMIN).required(),
    auth_provider: Joi.string().valid(AuthProvider.EMAIL, AuthProvider.GOOGLE).required()
})

class BaseResponse {
    constructor(success = true, message = null, data = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

class TokenData {
    constructor(access_token, refresh_token) {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.token_type = 'Bearer';
    }
}

class TokenResponse extends BaseResponse {
    constructor(success, message, tokenData) {
        super(success, message, tokenData);
    }
}

export {
    LoginEntitySchema,
    BaseResponse,
    TokenData,
    TokenResponse
};