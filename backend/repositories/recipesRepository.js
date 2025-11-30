const { setupLogging, getLogger } = require('../core/logger');
setupLogging();
const logger = getLogger("recipes-repo");
const { recipesArraySchema } = require('../schemas/recipes.js')

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

}

module.exports = RecipesRepository