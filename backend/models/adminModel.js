const Joi = require("joi")
const {v4: uuidv4} = require("uuid")

const now = () => new Date().toISOString();

const AdminProfileFields = Object.freeze({
    adminId: 'userId',
    full_name: 'full_name',
    email: 'email',
})

const AdminProfileSchema = Joi.object({
    [AdminProfileFields.adminId]: Joi.string().guid({ version: "uuidv4" }).default(() => uuidv4()),
    [AdminProfileFields.full_name]: Joi.string().required(),
    [AdminProfileFields.email]: Joi.string().email().required(),
    createdAt: Joi.date().default(() => now()).description("Timestamp when the user was created"),
    updatedAt: Joi.date().default(() => now()).description("Timestamp when the user was last updated"),
})

module.exports = {
    AdminProfileFields,
    AdminProfileSchema,
}