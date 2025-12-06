const express = require('express')

const router = express.Router()
const { setupLogging, getLogger } = require('../core/logger')
const { getAdminService, getCuisinesService, getIngredientsService, getRecipesService } = require('../core/deps')
const { ValidationError } = require('../core/exception')
const { EntityType } = require('../core/enum')

const allowedEntities = require('../middleware/authMiddleware')

const { registerAdminSchema, StandardResponse } = require('../schemas/adminSchema')
const {recipeInputSchema} = require('../schemas/recipes')

const {cuisineModel} = require('../models/cuisines')
const {ingredientModel} = require('../models/ingredients')

setupLogging()
const logger = getLogger('admin-routes')

router.post('/register', async (req, res, next) => {
    const adminService = getAdminService()
    const { error, value } = registerAdminSchema.validate(req.body)
    if (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
    }
    const admin = await adminService.registerAdmin(value)
    return res.json (new StandardResponse(true, 'Admin registered successfully', admin))
})

router.get('/me', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService();
  // logger.info(req.user)
  const email = req.user.email;
  const profile = await adminService.getAdminProfile(email)
  logger.info(`Fetched profile for user: ${JSON.stringify(profile)}`);
  return res.json(new StandardResponse(true, 'User profile fetched successfully', profile))
})

router.delete('/me', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService()
  const email = req.user.email
  const result = await adminService.deleteUser(email)
  if (!result){
    logger.error(`Failed to delete user with ID: ${userId}`);
  }
  logger.info(`Deleted user with email: ${email}`);
  return res.json(new StandardResponse(true, 'Admin deleted successfully', {"email": email}))
})

router.get('/users', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService()
  const { search = null, page = 1, limit = 10 } = req.query
  const users = await adminService.getAllUsers({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
  logger.info(`Fetched users from DB: ${JSON.stringify(users)}`);
  return res.json (new StandardResponse(true, 'All users fetched successfully', { page, limit, users }))
})

module.exports = router

router.post('/cuisine', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  const cuisineService = getCuisinesService()
  const { error, value} =  cuisineModel.validate(req.body)
  const name = value.name.toLowerCase();
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const cuisine = await cuisineService.addCuisine(name)
  logger.info(`Added cuisine: ${JSON.stringify(cuisine)}`);
  return resp.json (new StandardResponse(true, 'Cuisine added successfully', cuisine))
})

router.post('/ingredient', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  const ingredientsService = getIngredientsService()
  const { error, value} =  ingredientModel.validate(req.body)
  const name = value.name.toLowerCase();
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const ingredient = await ingredientsService.addIngredient(name)
  logger.info(`Added ingredient: ${JSON.stringify(ingredient)}`);
  return resp.json (new StandardResponse(true, 'Ingredient added successfully', ingredient))
})

router.post('/recipe', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  const recipeService = getRecipesService()
  const cuisineService = getCuisinesService()
  const ingredientService = getIngredientsService()
  const { error, value} =  recipeInputSchema.validate(req.body)
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const prep_time = value.prep_time
  let prep_time_str = null;
  if (typeof prep_time === "number" && prep_time > 0) {
    prep_time_str = `${prep_time} mins`;
  }
  const cuisineName = value.cuisine_name.toLowerCase();
  const cuisine_id = await cuisineService.ensureCuisineExist(cuisineName);
  const processedIngredients = await ingredientService.ensureIngredientsExist(value.ingredients);
  const recipe_payload = {
    title: value.title.toLowerCase(),
    instruction: value.instruction,
    prep_time: prep_time_str,
    cuisine_id,
    ingredients: processedIngredients,
  }
  logger.info(`Final recipe payload: ${JSON.stringify(recipe_payload)}`);
  const recipe_and_ingredients = await recipeService.addRecipe(recipe_payload)
  logger.info(`Added recipe with ingredients: ${JSON.stringify(recipe_and_ingredients)}`);
  return resp.json (new StandardResponse(true, 'Recipe added successfully', {"cuisine_id": cuisine_id, "recipe": recipe_and_ingredients.recipe, "ingredients": recipe_and_ingredients.ingredients}) )
})

router.delete('/recipe/:recipe_id', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  try {
    const recipeService = getRecipesService();
    const recipe_id = Number(req.params.recipe_id);
    if (!recipe_id || isNaN(recipe_id)) {
      return next(new ValidationError("Invalid recipe_id", 400, "VALIDATION_ERROR"));
    }
    const result = await recipeService.deleteRecipe(recipe_id);
    return resp.json(new StandardResponse(true, "Recipe deleted successfully", result));
  } catch (err) {
    next(err);
  }
});
