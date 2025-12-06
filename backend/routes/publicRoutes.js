const express = require('express');
const router = express.Router();
const { setupLogging, getLogger } = require('../core/logger');
const { getIngredientsService, getCuisinesService, getRecipesService } = require('../core/deps')
const { StandardResponse } = require('../schemas/adminSchema')

setupLogging();
const logger = getLogger("public-router");

router.get('/ingredients', async (req, resp, next) => {
    const ingredientsService = getIngredientsService()
    const { search = null, page = 1, limit = 10 } = req.query
    const ingredients = await ingredientsService.getAllIngredients({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
    return resp.json(new StandardResponse(true, 'All ingredients fetched successfully', {page, limit, ingredients}))
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

