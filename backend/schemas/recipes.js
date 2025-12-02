const Joi = require('joi');

const ingredientItemSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.string().optional(),
  unit: Joi.string().optional().allow(null, "")
});

const recipeInputSchema = Joi.object({
  title: Joi.string().required(),
  instruction: Joi.string().required(),
  prep_time: Joi.number().integer().optional().allow(null, 0),
  cuisine_name: Joi.string().required(),
  ingredients: Joi.array().items(ingredientItemSchema).min(1).required(),
});

const recipeSchema = Joi.object({
  recipe_id: Joi.number().integer().required(),
  title: Joi.string().required(),
  instruction: Joi.string().required(),
  prep_time: Joi.string().required(),
  cuisine_name: Joi.string().required(),
  views: Joi.number().integer().required(),
  no_of_bookmarks: Joi.number().integer().required(),
});

const recipesArraySchema = Joi.array().items(recipeSchema).required();

module.exports = {
    recipeSchema,
    recipesArraySchema,
    recipeInputSchema
}