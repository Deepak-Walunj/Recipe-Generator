const Joi = require('joi');
const { EntityType } = require('../core/enum');
const {v4: uuidv4} = require("uuid");

const now = () => new Date().toISOString();

const AuthEntityFields = Object.freeze({
  userId: 'userId',
  email: 'email',
  hashed_password: 'hashed_password',
  entity_type: 'entity_type',
})

const AuthEntitySchema  = Joi.object({
  [AuthEntityFields.userId]: Joi.string().default(()=>uuidv4()).description("unique user ID"), // can be auto-generated
  [AuthEntityFields.email]: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  [AuthEntityFields.hashed_password]: Joi.string().min(6).required().messages({
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
  createdAt: Joi.date().default(() => now()).description("Timestamp when the user was created"),
  updatedAt: Joi.date().default(() => now()).description("Timestamp when the user was last updated"),
});

const EntityProfileSchema = Joi.object({
  userId: Joi.string().default(() => uuidv4()).required(),
  full_name: Joi.string().min(2).required().messages({
    "string.empty": "Full name is required"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required"
  }),
  createdAt: Joi.date().default(now).description("Timestamp when the user was created"),
  updatedAt: Joi.date().default(now).description("Timestamp when the user was last updated"),
});

module.exports = {
  AuthEntityFields,
  AuthEntitySchema,
  EntityProfileSchema
};
