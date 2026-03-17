const Joi = require('joi');
const { EntityType } = require('../core/enum');

const AuthEntityFields = Object.freeze({
  USER_ID: 'user_id',
  USERNAME: 'username',
  EMAIL: 'email',
  ENTITY_TYPE: 'entity_type',
  PASSWORD: 'password',
  IS_VERIFIED: 'is_verified'
})

const AuthEntityModel  = Joi.object({
  [AuthEntityFields.USERNAME]: Joi.string().required(),
  [AuthEntityFields.EMAIL]: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  [AuthEntityFields.PASSWORD]: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required"
  }),
  [AuthEntityFields.ENTITY_TYPE]: Joi.string()
    .valid(...Object.values(EntityType)).required().messages({
      "any.only": `Entity type must be one of: ${Object.values(EntityType).join(', ')}`,
      "string.empty": "Entity type is required"
    }),
  [AuthEntityFields.IS_VERIFIED]: Joi.boolean().truthy(1).falsy(0).default(false)
});

const EntityProfileSchema = Joi.object({
  username: Joi.string().min(2).required().messages({
    "string.empty": "Full name is required"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  users_type: Joi.string().valid(...Object.values(EntityType)).required()
});

module.exports = {
  AuthEntityFields,
  AuthEntityModel,
  EntityProfileSchema
};
