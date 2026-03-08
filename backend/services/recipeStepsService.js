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
        return await this.recipeStepsRepository.addRecipeSteps(recipe_steps_payload)
    }

    async getRecipeStepsByRecipeId(recipe_id){
        logger.info(`Getting recipe steps for recipe ID: ${recipe_id}`)
        return await this.recipeStepsRepository.getRecipeStepsByRecipeId(recipe_id)
    }

    async updateRecipeSteps(recipe_id, instruction){
        const recipe_steps_payload = await buildRecipeStepsPayload(recipe_id, instruction);
        logger.info(`Deleting recipe steps with recip ID: ${recipe_id}`);
        const delete_result = await this.recipeStepsRepository.deleteByRecipeId(recipe_id)
        logger.info(`Deleted ${delete_result.affectedRows} recipe steps for recipe ID: ${recipe_id}`);
        logger.info(`Adding recipe steps`);
        return await this.recipeStepsRepository.updateRecipeSteps(recipe_steps_payload)
    }
}

module.exports = RecipeStepsService