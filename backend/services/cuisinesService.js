const { setupLogging, getLogger } = require('../core/logger')

setupLogging();
const logger = getLogger('cuisines-service')

class CuisinesService{
    constructor({cuisinesRepository}){
        this.cuisinesRepository = cuisinesRepository
    }

    async getAllCuisines(searchStr){
        const cuisines = await this.cuisinesRepository.getAllCuisines(searchStr=searchStr);
        if (cuisines.length !== 0){
            logger.info(`Fetched cuisines: ${JSON.stringify(cuisines)}`)
        }else{
            logger.info(`No ingredients fetched`)
        }
        return cuisines;
    }

    async addCuisine(name){
        logger.info(`Adding cuisine: ${JSON.stringify(name)}`)
        const cuisine = await this.cuisinesRepository.addCuisine(name)
        return cuisine
    }

    async ensureCuisineExist(cuisineName){
        const allCuisines = await this.getAllCuisines();
        const cuisineMap = new Map(allCuisines.map(c => [c.name, c.cuisine_id]))
        logger.info(`Cuisines Map: ${JSON.stringify(Array.from(cuisineMap.entries()))}`);
        let cuisine_id = cuisineMap.get(cuisineName);
        if (!cuisine_id){
            const cuisine = await this.addCuisine(cuisineName.toLowerCase())
            cuisine_id = cuisine.cuisine_id;
            logger.info(`Added cuisine: ${JSON.stringify(cuisine)}`);
        }
        return cuisine_id;
    }
}

module.exports = CuisinesService