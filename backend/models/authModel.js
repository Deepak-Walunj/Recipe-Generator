const Joi = require('joi');
const { EntityType } = require('../core/enum');
const {v4: uuidv4} = require("uuid");

const now = () => new Date().toISOString();

const AuthEntityFields = Object.freeze({
  user_id: 'user_id',
  email: 'email',
  password: 'password',
  entity_type: 'entity_type',
})

const AuthEntitySchema  = Joi.object({
  [AuthEntityFields.user_id]: Joi.number().optional(),
  [AuthEntityFields.email]: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  [AuthEntityFields.password]: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required"
  }),
  [AuthEntityFields.entity_type]: Joi.string()
    .valid(...Object.values(EntityType))
    .required()
    .messages({
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
