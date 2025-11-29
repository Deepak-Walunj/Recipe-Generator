const Joi = require("joi");
const { EntityType } = require('../core/enum');

const now = () => new Date().toISOString();

const UserProfileFields = Object.freeze({
  USER_ID: 'user_id',
  USERNAME: 'username',
  EMAIL: 'email',
  USERS_TYPE: 'users_type',
  PASSWORD: 'password'
});

const UserProfileSchema = Joi.object({
  [UserProfileFields.USER_ID]: Joi.number().optional(),
  [UserProfileFields.USERNAME]: Joi.string().required(),
  [UserProfileFields.EMAIL]: Joi.string().email().required(),
  [UserProfileFields.PASSWORD]: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required"
  }),
  [UserProfileFields.USERS_TYPE]: Joi.string()
    .valid(...Object.values(EntityType)).required().messages({
      "any.only": `Entity type must be one of: ${Object.values(EntityType).join(', ')}`,
      "string.empty": "Entity type is required"
    }),
});

module.exports = {
    UserProfileFields,
    UserProfileSchema,
};