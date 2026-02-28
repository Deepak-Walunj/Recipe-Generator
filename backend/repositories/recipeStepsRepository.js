const { setupLogging, getLogger } = require('../core/logger')
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
}

module.exports = RecipeStepsRepository