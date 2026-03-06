const { setupLogging, getLogger } = require('../core/logger');
const {cuisinesArraySchema} = require(`../schemas/cuisines`)
const {cuisineFields} = require('../models/cuisines.js')
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
            return await cuisinesArraySchema.validateAsync(rows, {stripUnknown: true})
        }catch(err){
            logger.info(`Error fetching cuisines: ${err}`)
        }
    }

    async addCuisine(name){
        const result = await this.collection.insertOne({[cuisineFields.NAME]: name})
        return {...name, cuisine_id: result.insertedId}
    }

    async getCuisineByName(name){
        return await this.collection.findOne({[cuisineFields.NAME]: name})
    }
}

module.exports = CuisinesRepository