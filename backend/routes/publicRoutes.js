import express from 'express';
const router = express.Router();
import { setupLogging, getLogger } from '../core/logger.js';
import { getUserService, getIngredientsService, getCuisinesService, getRecipesService } from '../core/deps.js';import { StandardResponse } from '../schemas/adminSchema.js';import { EntityType } from '../core/enum.js';

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

export default router;