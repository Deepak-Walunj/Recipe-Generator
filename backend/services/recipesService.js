const { setupLogging, getLogger } = require('../core/logger')
const { ValidationError } = require('../core/exception');

const { recipeModel } = require('../models/recipes.js');
const { recipeIngredientArrayModel } = require('../models/recipeIngredient.js');
setupLogging();
const logger = getLogger('recipes-service')

class RecipesService{
    constructor({recipesRepository, recipeIngredientsRepository}){
        this.recipesRepository = recipesRepository;
        this.recipeIngredientsRepository = recipeIngredientsRepository;
    }

    async getAllRecipes({searchStr = null, page = 1, limit = 10}){
        const recipes = await this.recipesRepository.getAllRecipes({searchStr:searchStr, page:page, limit:limit});
        if (recipes.length !== 0){
            logger.info(`Fetched all recipes`)
        }else{
            logger.info(`No recipes fetched`)
        }
        return recipes;
    }

    async addRecipe(recipePayload){
        const recipeValidation  = recipeModel.validate({
            title: recipePayload.title,
            instruction: recipePayload.instruction,
            prep_time: recipePayload.prep_time,
            cuisine_id: recipePayload.cuisine_id
        }, {stripUnknown: true})
        if (recipeValidation.error){
            return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
        }
        // logger.info(`Adding recipe: ${JSON.stringify(recipeValidation.value)}`)

        const recipe = await this.recipesRepository.addRecipe(recipeValidation.value)
        const recipe_id = recipe.recipe_id;
        logger.info(`Recipe added with ID: ${recipe_id}`);

        const recipeIngredients = recipePayload.ingredients.map(item => ({
            recipe_id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit: item.unit
        }));
        const recipeIngredientsValidation = recipeIngredientArrayModel.validate(recipeIngredients);
        if (recipeIngredientsValidation.error) {
            throw new ValidationError(
                recipeIngredientsValidation.error.message,
                400,
                'VALIDATION_ERROR',
                recipeIngredientsValidation.error.details
            );
        }

        const addedIngredients = []
        logger.info(`Adding recipe ingredients: ${JSON.stringify(recipeIngredientsValidation.value)}`);
        for (const row of recipeIngredientsValidation.value) {
            // logger.info(`Adding recipe ingredient: ${JSON.stringify(row)}`);
            const addedIngredient = await this.recipeIngredientsRepository.addRecipeIngredient(row);
            addedIngredients.push(addedIngredient);
        }

        return {recipe: recipe, ingredients: addedIngredients};
    }

    async deleteRecipe(recipeId){
        const existingRecipe = await this.recipesRepository.getRecipeById(recipeId);
        if (!existingRecipe){
            throw new ValidationError(`Recipe with ID ${recipeId} does not exist`, 404, 'NOT_FOUND', null);
        }
        const existingIngredients = await this.recipeIngredientsRepository.getIngredientsByRecipeId(recipeId);
        if (existingIngredients.length === 0){
            throw new ValidationError(`No ingredients found for recipe ID ${recipeId}`, 404, 'NOT_FOUND', null);
        }
        logger.info(`Found existing recipe: ${JSON.stringify(existingRecipe)} with ID: ${recipeId}`);
        logger.info(`Found existing ingredients: ${JSON.stringify(existingIngredients)} with ID: ${recipeId}`);
        const deletedRecipeIngredients = await this.recipeIngredientsRepository.deleteByRecipeId(recipeId); 
        logger.info(`Deleted recipe ingredients: ${JSON.stringify(deletedRecipeIngredients)} for recipe ID: ${recipeId}`);
        const deletedRecipe = await this.recipesRepository.deleteById(recipeId);
        logger.info(`Deleted recipe: ${JSON.stringify(deletedRecipe)} with ID: ${recipeId}`);
        return { recipe:existingRecipe, ingredients:existingIngredients  };
    }
}

module.exports = RecipesService;