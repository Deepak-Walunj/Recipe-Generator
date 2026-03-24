const express = require('express');
const router = express.Router();
const { setupLogging, getLogger } = require('../core/logger');
const { getUserService, getIngredientsService, getCuisinesService, getRecipesService } = require('../core/deps')
const { StandardResponse } = require('../schemas/adminSchema')
const { EntityType } = require('../core/enum');

setupLogging();
const logger = getLogger("public-router");

router.post('/register', async (req, resp, next) => {
    try{
        const userService = getUserService()
        const value = {
            entity_type: EntityType.DEMO_USER
        };
        logger.info(value)
        const user = await userService.registerUser(value)
        return resp.json(new StandardResponse(true, "Demo user registered successfullt", user))
    }catch (error) {
        logger.error(error)
        next(error)
    }
})

router.get('/ingredients', async (req, resp, next) => {
    try{
        const ingredientsService = getIngredientsService()
        const { search = null, page = 1, limit = 10 } = req.query
        const ingredients = await ingredientsService.getAllIngredients({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
        return resp.json(new StandardResponse(true, 'All ingredients fetched successfully', {page, limit, ingredients}))
    } catch(error) {
        logger.error(error)
        next(error)
    }
})

router.get('/cuisines', async (req, resp, next) => {
    const cuisinesService = getCuisinesService()
    const {search} = req.query
    const cuisines = await cuisinesService.getAllCuisines(search)
    return resp.json(new StandardResponse(true, 'All cuisines fetched successfully', {cuisines}))  
})

router.get('/recipes', async (req, resp, next) => {
    const recipesService = getRecipesService()
    const { search = null, page = 1, limit = 10 } = req.query
    const recipes = await recipesService.getAllRecipes({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
    return resp.json(new StandardResponse(true, 'All recipes fetched successfully', {page, limit, recipes}))  
})

module.exports = router

