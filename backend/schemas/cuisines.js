const Joi = require('joi');

const cuisineSchema = Joi.object({
  cuisine_id: Joi.number().integer().required(),
  name: Joi.string().required()
});

const cuisinesArraySchema = Joi.array().items(cuisineSchema).required();

module.exports = {
    cuisineSchema,
    cuisinesArraySchema
}