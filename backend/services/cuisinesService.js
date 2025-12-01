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
}

module.exports = CuisinesService