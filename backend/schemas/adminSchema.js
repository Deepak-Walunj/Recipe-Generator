import Joi from 'joi';
import { EntityType, AuthProvider } from '../core/enum.js';

const registerAdminSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional().allow(null),
    entity_type: Joi.string().valid(EntityType.ADMIN).required(),
    auth_provider: Joi.string().valid(AuthProvider.EMAIL, AuthProvider.GOOGLE).required()
})

const deleteEntitySchema = Joi.object({
    entity_id: Joi.number().required(),
    entity_type: Joi.string().valid(EntityType.ADMIN, EntityType.USER).required().messages({ "any.only": "Entity type must be ADMIN", "string.empty": "Entity type is required" }),
})

const updateEntitySchema = Joi.object({
    email: Joi.string().email(),
    updated_name: Joi.string().optional(),
    updated_password: Joi.string().min(6).optional(),
})

const getEntitySchema = Joi.object({
    entity_id: Joi.number().required(),
    entity_type: Joi.string().valid(EntityType.ADMIN, EntityType.USER).required().messages({ "any.only": "Entity type must be ADMIN or USER", "string.empty": "Entity type is required" }),
})

class StandardResponse {
    constructor(success = true, message = null, data = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export {
    registerAdminSchema,
    deleteEntitySchema,
    updateEntitySchema,
    getEntitySchema,
    StandardResponse
};