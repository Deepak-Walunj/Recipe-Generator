const { setupLogging, getLogger } = require('../core/logger');

const { recipesArraySchema } = require('../schemas/recipes.js')

const {recipeFields} = require('../models/recipes.js');

setupLogging();
const logger = getLogger("recipes-repo");

class RecipesRepository{
    constructor(collection) {
        this.collection=collection
    }

    async getAllRecipes({ searchStr = null, page = 1, limit = 10 }) {
        let query = `SELECT 
                            r.recipe_id, 
                            r.title, 
                            r.instruction, 
                            r.prep_time, 
                            r.cuisine_id, 
                            c.name AS cuisine_name,
                            r.views, r.no_of_bookmarks 
                    FROM recipe r
                    JOIN cuisines c ON r.cuisine_id = c.cuisine_id
                    `;
        const params = [];
        if (searchStr && searchStr.trim() !== "") {
            query += ` WHERE r.title LIKE ? `;
            params.push(`%${searchStr}%`);
        }
        query += `LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number((page - 1) * limit));
        try {
            const [rows] = await this.collection.db.query(query, params);
            const validated = await recipesArraySchema.validateAsync(rows, {stripUnknown: true})
            return validated;
        } catch (err) {
            logger.error(`Error fetching recipes: ${err.message}`);
            throw err;
        }
    }
    async addRecipe(recipeData){
        const result = await this.collection.insertOne(recipeData);
        return { ...recipeData, recipe_id: result.insertedId };
    }

    async getRecipeById(recipeId){
        const result = await this.collection.findOne({ [recipeFields.RECIPE_ID]: recipeId });
        return result;
    }

    async deleteById(recipeId){
        const result = await this.collection.deleteOne({ [recipeFields.RECIPE_ID]: recipeId });
        logger.info(`Deleted ${result.deletedCount} recipe with ID: ${recipeId}`);
        return result;
    }
}

module.exports = RecipesRepository