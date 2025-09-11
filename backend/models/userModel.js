const Joi = require("joi");
const {v4: uuidv4} = require("uuid");

const now = () => new Date().toISOString();

const UserProfileFields = Object.freeze({
  userId: 'userId',
  full_name: 'full_name',
  email: 'email',
});

const UserProfileSchema = Joi.object({
  [UserProfileFields.userId]: Joi.string().guid({ version: "uuidv4" }).default(() => uuidv4()),
  [UserProfileFields.full_name]: Joi.string().required(),
  [UserProfileFields.email]: Joi.string().email().required(),
  createdAt: Joi.date().default(() => now()).description("Timestamp when the user was created"),
  updatedAt: Joi.date().default(() => now()).description("Timestamp when the user was last updated"),
});

module.exports = {
    UserProfileFields,
    UserProfileSchema,
};