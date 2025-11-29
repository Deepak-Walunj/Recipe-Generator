const Joi = require('joi');
const { EntityType } = require('../core/enum');

const AuthRegisterSchema = Joi.object({
    user_id: Joi.number().optional(),
    email: Joi.string().email().required().messages({"string.email": "Valid email is required"}),
    password: Joi.string().min(6).required().messages({"string.min": "Password must be at least 6 characters long", "string.empty": "Password is required"}),
    entity_type: Joi.string().valid(EntityType.USER, EntityType.ADMIN).required().messages({"any.only": "Entity type must be USER or ADMIN", "string.empty": "Entity type is required"}),
});

const LoginEntitySchema = Joi.object({
    email: Joi.string().email().required().messages({"string.email": "Valide email is required"}),
    password: Joi.string().min(6).required().messages({"string.min": "Password must be at least 6 characters long", "string.empty": "Password is required"}),
    entity_type: Joi.string().valid(EntityType.USER, EntityType.ADMIN).required().messages({"any.only": "Entity type must be USER or ADMIN", "string.empty": "Entity type is required"}),
})

class BaseResponse {
    constructor(success=true, message=null, data=null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

class TokenData {
    constructor(access_token, token_type="Bearer") {
        this.access_token = access_token;
        this.token_type = token_type;
    }
}

class TokenResponse extends BaseResponse {
    constructor(success, message, tokenData) {
        super(success, message, tokenData);
    }
}

module.exports = {
    AuthRegisterSchema,
    LoginEntitySchema,
    BaseResponse,
    TokenData,
    TokenResponse
}