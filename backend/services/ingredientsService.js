const { setupLogging, getLogger } = require('../core/logger')

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
}

module.exports = IngredientsService;