const express = require('express');
const router = express.Router();
const { setupLogging, getLogger } = require('../core/logger');
const { getIngredientsService } = require('../core/deps')
const { StandardResponse } = require('../schemas/adminSchema')

setupLogging();
const logger = getLogger("public-router");

router.get('/ingredients', async (req, resp, next) => {
    const ingredientsService = getIngredientsService()
    const { search = null, page = 1, limit = 10 } = req.query
    const ingredients = await ingredientsService.getAllIngredients({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
    return resp.json(new StandardResponse(true, 'All ingredients fetched successfully', {page, limit, ingredients}))
})

module.exports = router

