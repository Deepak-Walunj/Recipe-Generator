import Joi from 'joi';

const ingredientSchema = Joi.object({
  ingredient_id: Joi.number().integer().required(),
  name: Joi.string().required()
});

const ingredientsArraySchema = Joi.array().items(ingredientSchema).required();

export {ingredientSchema,
    ingredientsArraySchema};