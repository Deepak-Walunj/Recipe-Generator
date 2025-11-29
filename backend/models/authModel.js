const Joi = require('joi');
const { EntityType } = require('../core/enum');

const now = () => new Date().toISOString();

const AuthEntityFields = Object.freeze({
  USER_ID: 'user_id',
  EMAIL: 'email',
  ENTITY_TYPE: 'entity_type',
  PASSWORD: 'password'
})

const AuthEntitySchema  = Joi.object({
  [AuthEntityFields.USER_ID]: Joi.number().optional(),
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
});

const EntityProfileSchema = Joi.object({
  user_id: Joi.number().optional(),
  username: Joi.string().min(2).required().messages({
    "string.empty": "Full name is required"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  password: Joi.string().min(6).required(),
  users_type: Joi.string().valid(...Object.values(EntityType)).required()
});

module.exports = {
  AuthEntityFields,
  AuthEntitySchema,
  EntityProfileSchema
};
