const { setupLogging, getLogger } = require('../core/logger');
const {cuisinesArraySchema} = require(`../schemas/cuisines`)
setupLogging();
const logger = getLogger("cuisines-repo");

class CuisinesRepository{
    constructor(collection){
        this.collection=collection
    }

    async getAllCuisines(searchStr){
        let query = `SELECT cuisine_id, name FROM cuisines `
        const params =[]
        if (searchStr && searchStr.trim() !== ""){
            query += `WHERE name LIKE ? `
            params.push(`%${searchStr}%`)
        }
        try{
            const [rows] = await this.collection.db.query(query, params)
            const validated = await cuisinesArraySchema.validateAsync(rows, {stripUnknown: true})
            return validated;
        }catch(err){
            logger.info(`Error fetching cuisines: ${err}`)
        }
    }
}

module.exports = CuisinesRepository