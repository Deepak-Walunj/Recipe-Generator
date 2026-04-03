import { setupLogging, getLogger } from '../core/logger.js';import { recipeStepsFields } from '../models/recipeSteps.js';setupLogging();
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

    async getRecipeStepsByRecipeId(recipe_id){
        const steps = await this.collection.findMany({ [recipeStepsFields.RECIPE_ID]: recipe_id});
        if (!steps || steps.length === 0){
            logger.warn(`No recipe steps found for recipe ID : ${recipe_id}`)
            return [];
        }
        return steps;
    }

    async deleteByRecipeId(recipeId){
        const result = await this.collection.deleteMany({ [recipeStepsFields.RECIPE_ID]: recipeId });
        logger.info(`Deleted ${result.deletedCount} recipe steps for recipe ID: ${recipeId}`);
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

export default RecipeStepsRepository;