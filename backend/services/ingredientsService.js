const { setupLogging, getLogger } = require('../core/logger')

const { ingredientIdQuantityUnitSchemaArraySchema } = require('../schemas/recipeIngredient.js');

setupLogging();
const logger = getLogger('ingredients-service')

class IngredientsService{
    constructor({ingredientsRepository}){
        this.ingredientsRepository = ingredientsRepository;
    }

    async getAllIngredients({searchStr = null, page = 1, limit = 10}){
        const ingredients = await this.ingredientsRepository.getAllIngredients({searchStr:searchStr, page:page, limit:limit});
        if (ingredients.length !== 0){
            logger.info(`Fetched ingredients: ${JSON.stringify(ingredients)}`)
        }else{
            logger.info(`No ingredients fetched`)
        }
        return ingredients;
    }

    async addIngredient(name){
        logger.info(`Adding ingredient: ${JSON.stringify(name)}`)
        const ingredient = await this.ingredientsRepository.addIngredient(name)
        return ingredient
    }

    async ensureIngredientsExist(ingredientsArray){
        const allIngredients = await this.ingredientsRepository.getAllIngredients({searchStr: null, page: 1, limit: 1000});
        const ingredientMap = new Map(allIngredients.map(i => [i.name, i.ingredient_id]));
        const processed = []
        for (const item of ingredientsArray){
            const normalizedName = item.name.toLowerCase();
            let ingredient_id = ingredientMap.get(normalizedName);
            if (!ingredient_id){
                const ingredient = await this.addIngredient(normalizedName);
                ingredient_id = ingredient.ingredient_id;
                ingredientMap.set(normalizedName, ingredient_id);
                logger.info(`Added ingredient: ${JSON.stringify(ingredient)}`);
            }
            processed.push({ ingredient_id, quantity: item.quantity, unit: item.unit });
        }
        return ingredientIdQuantityUnitSchemaArraySchema.validateAsync(processed, {stripUnknown: true});
    }
}

module.exports = IngredientsService;