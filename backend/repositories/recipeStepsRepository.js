const { setupLogging, getLogger } = require('../core/logger')
const {recipeIngredientFields} = require('../models/recipeSteps.js')
setupLogging();
const logger = getLogger('recipeSteps-Repo')

class RecipeStepsRepository{
    constructor(collection){
        this.collection = collection
    }

    async addRecipeSteps(stepsPayload){
        const result = await this.collection.insertMany(stepsPayload);
        if (result.insertedCount === 0){
            logger.error(`No recipe steps were added.`);
        }
        return { ...stepsPayload, insertedCount: result };
    }

    async deleteByRecipeId(recipeId){
        const result = await this.collection.deleteMany({ [recipeIngredientFields.RECIPE_ID]: recipeId });
        logger.info(`Deleted ${result.deletedCount} recipe ingredients for recipe ID: ${recipeId}`);
        return result;
    }

    async updateRecipeSteps(stepsPayload){
        const result = await this.collection.insertMany(stepsPayload);
        if (result.insertedCount === 0){
            logger.error(`No recipe steps were updated.`);
        }
        return { ...stepsPayload, insertedCount: result}
    }
}

module.exports = RecipeStepsRepository