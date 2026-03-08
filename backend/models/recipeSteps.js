const Joi = require('joi');


const recipeStepsFields = Object.freeze({
  STEP_ID: 'step_id',
  RECIPE_ID: 'recipe_id',
  STEP_NUMBER: 'step_number',
  INSTRUCTION: 'instruction',
  CREATED_AT: 'created_at'
})

module.exports = {
    recipeStepsFields
}