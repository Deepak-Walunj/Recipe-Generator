const Joi = require('joi')

const cuisineFields = Object.freeze({
    CUISINE_ID: 'cuisine_id',
    NAME: 'name'
})

const cuisineModel = Joi.object({
    [cuisineFields.NAME]: Joi.string().required()
})

module.exports = {
    cuisineModel
}