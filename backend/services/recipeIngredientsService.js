import { setupLogging, getLogger } from '../core/logger.js';setupLogging();
const logger = getLogger('recipeIngredientsService-service')

class RecipeIngredientsService {
    constructor({ recipeIngredientsRepository}) {
        this.recipeIngredientsRepository = recipeIngredientsRepository;
    }

    async getIngredientsByRecipeId(recipe_id) {

    }
}

export default RecipeIngredientsService;