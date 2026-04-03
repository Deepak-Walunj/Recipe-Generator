import Joi from 'joi';
import { EntityType } from '../core/enum.js';

const now = () => new Date().toISOString();

const UserProfileFields = Object.freeze({
  USER_ID: 'user_id',
  USERNAME: 'username',
  EMAIL: 'email',
  USERS_TYPE: 'users_type',
  PASSWORD: 'password'
});

const UserProfileModel = Joi.object({
  [UserProfileFields.USER_ID]: Joi.number().optional(),
  [UserProfileFields.USERNAME]: Joi.string().required(),
  [UserProfileFields.EMAIL]: Joi.string().email().optional(),
  [UserProfileFields.PASSWORD]: Joi.string().min(6).optional().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required"
  }),
  [UserProfileFields.USERS_TYPE]: Joi.string()
    .valid(...Object.values(EntityType)).required().messages({
      "any.only": `Entity type must be one of: ${Object.values(EntityType).join(', ')}`,
      "string.empty": "Entity type is required"
    }),
});

export {
  UserProfileFields,
  UserProfileModel,
};