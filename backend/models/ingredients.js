const Joi = require('joi')

const ingredientFields = Object.freeze({
    INGREDIENT_ID: 'ingredient_id',
    NAME: 'name'
})

const ingredientModel = Joi.object({
    [ingredientFields.NAME]: Joi.string().required()
})

module.exports = {
    ingredientModel
}