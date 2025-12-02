const { setupLogging, getLogger } = require('../core/logger');

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
}

module.exports = RecipeIngredientsRepository