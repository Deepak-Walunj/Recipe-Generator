const { setupLogging, getLogger } = require('../core/logger')

setupLogging();
const logger = getLogger('recipeIngredientsService-service')

class RecipeIngredientsService {
    constructor({ recipeIngredientsRepository}) {
        this.recipeIngredientsRepository = recipeIngredientsRepository;
    }

    async getIngredientsByRecipeId(recipe_id) {

    }
}

module.exports = RecipeIngredientsService;