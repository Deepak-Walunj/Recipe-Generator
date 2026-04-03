
import Joi from 'joi';
import { EntityType, AuthProvider } from '../core/enum.js';

const registerUserSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional().allow(null),
    entity_type: Joi.string().valid(EntityType.USER).required(),
    auth_provider: Joi.string().valid(AuthProvider.EMAIL, AuthProvider.GOOGLE).required(),
})

export { registerUserSchema };