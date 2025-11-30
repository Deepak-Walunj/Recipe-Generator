const { setupLogging, getLogger } = require('../core/logger')

setupLogging();
const logger = getLogger('recipes-service')

class RecipesService{
    constructor({recipesRepository}){
        this.recipesRepository = recipesRepository;
    }

    async getAllRecipes({searchStr = null, page = 1, limit = 10}){
        const recipes = await this.recipesRepository.getAllRecipes({searchStr:searchStr, page:page, limit:limit});
        if (recipes.length !== 0){
            logger.info(`Fetched recipes: ${JSON.stringify(recipes)}`)
        }else{
            logger.info(`No recipes fetched`)
        }
        return recipes;
    }
}

module.exports = RecipesService;