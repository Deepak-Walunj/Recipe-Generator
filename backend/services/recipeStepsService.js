const { setupLogging, getLogger } = require('../core/logger')
const {buildRecipeStepsPayload} = require('../core/utility')

setupLogging();
const logger = getLogger('recipeSteps-service')

class RecipeStepsService{
    constructor({recipeStepsRepository}){
        this.recipeStepsRepository = recipeStepsRepository;
    }

    async addRecipeSteps(stepsPayload){
        const recipe_steps_payload = await buildRecipeStepsPayload(stepsPayload.recipe_id, stepsPayload.instruction);
        logger.info(`Adding recipe steps: ${JSON.stringify(recipe_steps_payload.step_number)}`);
        const recipe_steps_result = await this.recipeStepsRepository.addRecipeSteps(recipe_steps_payload)
        return recipe_steps_result
    }
}

module.exports = RecipeStepsService