import Joi from 'joi';
import { EntityType } from '../core/enum.js';

const AuthEntityFields = Object.freeze({
  USER_ID: 'user_id',
  USERNAME: 'username',
  EMAIL: 'email',
  ENTITY_TYPE: 'entity_type',
  PASSWORD: 'password',
  IS_VERIFIED: 'is_verified',
  CREATED_AT: 'created_at',
  EXPIRES_AT: 'expires_at'
})

const AuthEntityModel  = Joi.object({
  [AuthEntityFields.USERNAME]: Joi.string().required(),
  [AuthEntityFields.EMAIL]: Joi.string().email().allow(null).messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  [AuthEntityFields.PASSWORD]: Joi.string().min(6).allow(null).messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required"
  }),
  [AuthEntityFields.ENTITY_TYPE]: Joi.string()
    .valid(...Object.values(EntityType)).required().messages({
      "any.only": `Entity type must be one of: ${Object.values(EntityType).join(', ')}`,
      "string.empty": "Entity type is required"
    }),
  [AuthEntityFields.IS_VERIFIED]: Joi.boolean().truthy(1).falsy(0).default(false),
  [AuthEntityFields.CREATED_AT]: Joi.forbidden(),
  [AuthEntityFields.EXPIRES_AT]: Joi.date().when(AuthEntityFields.ENTITY_TYPE, {
    is: EntityType.DEMO_USER,
    then: Joi.date().required(),
    otherwise: Joi.forbidden()
  })
}).options({ stripUnknown: true });

export {AuthEntityFields,
  AuthEntityModel,};
