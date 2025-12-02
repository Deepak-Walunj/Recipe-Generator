const { setupLogging, getLogger } = require('../core/logger');
const { recipeIngredientFields } = require('../models/recipeIngredient.js');
setupLogging();
const logger = getLogger("recipe_ingredients-repo");

class RecipeIngredientsRepository{
    constructor(collection){
        this.collection=collection
    }

    async addRecipeIngredient(recipeIngredientData){
        const result = await this.collection.insertOne(recipeIngredientData);
        return { ...recipeIngredientData, recipe_ingredient_id: result.insertedId };
    }

    async deleteByRecipeId(recipeId){
        const result = await this.collection.deleteMany({ [recipeIngredientFields.RECIPE_ID]: recipeId });
        logger.info(`Deleted ${result.deletedCount} recipe ingredients for recipe ID: ${recipeId}`);
        return result;
    }

    async getIngredientsByRecipeId(recipeId){
        const results = await this.collection.findMany({ [recipeIngredientFields.RECIPE_ID]: recipeId });
        return results;
    }
}

module.exports = RecipeIngredientsRepository