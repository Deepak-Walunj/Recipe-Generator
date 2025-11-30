const { setupLogging, getLogger } = require('../core/logger');
setupLogging();
const logger = getLogger("ingredient-repo");
const { ingredientsArraySchema } = require('../schemas/ingredients.js')

class IngredientsRepository{
    constructor(collection) {
        this.collection=collection
    }

    async getAllIngredients({ searchStr = null, page = 1, limit = 10 }) {
        let query = `SELECT ingredient_id, name FROM ingredients `;
        const params = [];
        if (searchStr && searchStr.trim() !== "") {
            query += `WHERE name LIKE ? `;
            params.push(`%${searchStr}%`);
        }
        query += `LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number((page - 1) * limit));
        try {
            const [rows] = await this.collection.db.query(query, params);
            const validated = await ingredientsArraySchema.validateAsync(rows, {stripUnknown: true})
            return validated;
        } catch (err) {
            logger.error(`Error fetching ingredients: ${err.message}`);
            throw err;
        }
    }

}

module.exports = IngredientsRepository