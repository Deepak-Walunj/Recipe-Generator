import Joi from 'joi';
import { EntityType } from '../core/enum.js';

const registerAdminSchema = Joi.object({
    username: Joi.string().required().messages({"string.empty": "Full name is required"}),
    email: Joi.string().email().required().messages({"string.email": "Valid email is required"}),
    password: Joi.string().min(6).required().messages({"string.min": "Password must be at least 6 characters long", "string.empty": "Password is required"}),
    entity_type: Joi.string().valid(EntityType.ADMIN).required().messages({"any.only": "Entity type must be ADMIN", "string.empty": "Entity type is required"}),
})

const deleteEntitySchema = Joi.object({
    entity_id: Joi.number().required(),
    entity_type: Joi.string().valid(EntityType.ADMIN, EntityType.USER).required().messages({"any.only": "Entity type must be ADMIN", "string.empty": "Entity type is required"}),
})

const updateEntitySchema = Joi.object({
    email: Joi.string().email(),
    updated_name: Joi.string().optional(),
    updated_password: Joi.string().min(6).optional(),
})

const getEntitySchema = Joi.object({
    entity_id: Joi.number().required(),
    entity_type: Joi.string().valid(EntityType.ADMIN, EntityType.USER).required().messages({"any.only": "Entity type must be ADMIN or USER", "string.empty": "Entity type is required"}),
})

class StandardResponse {
    constructor(success=true, message=null, data=null){
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export {registerAdminSchema,
    deleteEntitySchema,
    updateEntitySchema,
    getEntitySchema,
    StandardResponse};