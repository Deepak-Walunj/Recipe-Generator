const Joi = require('joi');

const recipeFields = Object.freeze({
    RECIPE_ID: 'recipe_id',
    TITLE: 'title',
    INSTRUCTION: 'instruction',
    PREP_TIME: 'prep_time',
    CUISINE_ID: 'cuisine_id',
    VIEWS: 'views',
    NO_OF_BOOKMARKS: 'no_of_bookmarks'
});

const recipeModel = Joi.object({
    [recipeFields.TITLE]: Joi.string().required(),
    [recipeFields.INSTRUCTION]: Joi.string().required(),
    [recipeFields.PREP_TIME]: Joi.string().allow(null, '').optional(),
    [recipeFields.CUISINE_ID]: Joi.number().integer().required(),
    [recipeFields.VIEWS]: Joi.number().integer().min(0).default(0),
    [recipeFields.NO_OF_BOOKMARKS]: Joi.number().integer().min(0).default(0)
})

module.exports = {
    recipeFields,
    recipeModel
}