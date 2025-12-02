const Joi = require('joi');

const recipeIngredientFields = Object.freeze({
  RECIPE_INGREDIENT_ID: 'recipe_ingredient_id',
  RECIPE_ID: 'recipe_id',
  INGREDIENT_ID: 'ingredient_id',
  QUANTITY: 'quantity',
  UNIT: 'unit'
});

const recipeIngredientModel = Joi.object({
  [recipeIngredientFields.RECIPE_ID]: Joi.number().integer().required(),
  [recipeIngredientFields.INGREDIENT_ID]: Joi.number().integer().required(),
  [recipeIngredientFields.QUANTITY]: Joi.string().required(),
  [recipeIngredientFields.UNIT]: Joi.string().allow(null, '').optional()
});

const recipeIngredientArrayModel = Joi.array().items(recipeIngredientModel);

module.exports = {
    recipeIngredientModel,
    recipeIngredientFields,
    recipeIngredientArrayModel
}
