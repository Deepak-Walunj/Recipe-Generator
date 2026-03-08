const Joi = require('joi');

const ingredientIdQuantityUnitSchema = Joi.object({
  ingredient_id: Joi.number().integer().required(),
  quantity: Joi.string().required(),
  unit: Joi.string().allow(null, '').optional()
});

const ingredientIdQuantityUnitSchemaArraySchema = Joi.array().items(ingredientIdQuantityUnitSchema).min(1).required();
module.exports = {
    ingredientIdQuantityUnitSchema,
    ingredientIdQuantityUnitSchemaArraySchema
}