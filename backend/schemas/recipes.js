const Joi = require('joi');

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
    recipesArraySchema
}