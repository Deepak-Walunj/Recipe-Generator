const Joi = require('joi');

const ingredientSchema = Joi.object({
  ingredient_id: Joi.number().integer().required(),
  name: Joi.string().required()
});

const ingredientsArraySchema = Joi.array().items(ingredientSchema).required();

module.exports = {
    ingredientSchema,
    ingredientsArraySchema
}