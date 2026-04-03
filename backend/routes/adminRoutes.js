import express from 'express';const router = express.Router()

import { setupLogging, getLogger } from '../core/logger.js';import { getAdminService, getCuisinesService, getIngredientsService, getRecipesService, getRecipeStepsService, getRecipeIngredientsService } from '../core/deps.js';import { ValidationError, NotFoundError } from '../core/exception.js';import { EntityType } from '../core/enum.js';import { allowedEntities } from '../middleware/authMiddleware.js';import { registerAdminSchema, deleteEntitySchema, StandardResponse } from '../schemas/adminSchema.js';import { recipeInputSchema, recipeUpdateSchema } from '../schemas/recipes.js';import { updateEntitySchema, getEntitySchema } from '../schemas/adminSchema.js';import { cuisineModel } from '../models/cuisines.js';import { ingredientModel } from '../models/ingredients.js';setupLogging()
const logger = getLogger('admin-routes')

router.post('/register', async (req, res, next) => {
    const adminService = getAdminService()
    const { error, value } = registerAdminSchema.validate(req.body)
    if (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
    }
    const resp = await adminService.registerAdmin(value)
    return res.json (new StandardResponse(true, resp.message, {"email_verification_token": resp.email_verification_token}))
})

router.get('/me', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService();
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

router.delete('/entity', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService()
  const email = req.user.email
  const { error, value } = deleteEntitySchema.validate(req.body)
    if (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
    }
  const entity_id=value.entity_id
  const entity_type=value.entity_type
  if (!entity_id || isNaN(entity_id)) {
    return next(new ValidationError("Invalid recipe_id", 400, "VALIDATION_ERROR"));
  }
  const admin = await adminService.findUserbyId(entity_id, entity_type)
  if (!admin){
    return next(new NotFoundError("Entity not found", 404, "NOT_FOUND", {"Entity_id": entity_id}))
  }
  const result = await adminService.deleteUserbyId(admin.user_id)
  if (!result){
    logger.error(`Failed to delete admin with ID: ${entity_id}`);
  }
  logger.info(`Deleted admin with admin id: ${entity_id}`);
  return res.json(new StandardResponse(true, 'Admin deleted successfully', {"by_email": email, "deleted_email": admin.email}))
})

router.get('/entity', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService()
  const {error, value} = getEntitySchema.validate(req.query)
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const user = await adminService.findUserbyId(value.entity_id, value.entity_type)
  return res.json(new StandardResponse(true, 'Entity fetched successfully', {"Entity": user}))
})

router.get('/entities', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  const adminService = getAdminService()
  const { search = null, page = 1, limit = 10 } = req.query
  const users = await adminService.getAllUsers({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
  logger.info(`Fetched users from DB: ${JSON.stringify(users)}`);
  return res.json (new StandardResponse(true, 'All users fetched successfully', { page, limit, users }))
})

router.put('/entity', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  const adminService = getAdminService()
  const {error, value} = updateEntitySchema.validate(req.body)
  if(error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const updated_user= await adminService.updateEntityDetails(value)
  return resp.json(new StandardResponse(true, 'Entity updated successfully', {"Updated profile": updated_user}))
})

router.post('/cuisine', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  const cuisineService = getCuisinesService()
  const { error, value} =  cuisineModel.validate(req.body)
  const name = value.name.toLowerCase();
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
  }
  const cuisine_id = await cuisineService.addCuisine(name)
  logger.info(`Added cuisine: ${JSON.stringify(cuisine_id)}`);
  return resp.json (new StandardResponse(true, 'Cuisine added successfully', cuisine_id))
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

router.get('/ingredients/:recipe_id', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  try{
    const recipe_id = Number(req.params.recipe_id);
    if (!recipe_id || isNaN(recipe_id)){
      return next(new ValidationError("Invalid recipe_id", 400, "VALIDATION_ERROR"));
    }
    const recipeIngredientsService = getRecipeIngredientsService()
    const ingredients = await recipeIngredientsService.getIngredientsByRecipeId(recipe_id)
    return resp.json(new StandardResponse(true, "Ingredients fetched successfully", {ingredients}))
  }catch (err){
    next(err)
  }
})

router.post('/recipe', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  try{
  const recipeService = getRecipesService()
  const cuisineService = getCuisinesService()
  const ingredientService = getIngredientsService()
  const recipeStepsService = getRecipeStepsService()
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
  let cuisine_id = await cuisineService.getCuisineIdByName(cuisineName);
  if (!cuisine_id){
    logger.info(`Cuisine not found, adding new cuisine: ${cuisineName}`);
    cuisine_id = await cuisineService.addCuisine(cuisineName);
  }
  const processedIngredients = await ingredientService.ensureIngredientsExist(value.ingredients);
  const recipe_payload = {
    title: value.title.toLowerCase(),
    instruction: value.instruction,
    prep_time: prep_time_str,
    cuisine_id,
    ingredients: processedIngredients,
  }
  const recipe_and_ingredients = await recipeService.addRecipe(recipe_payload)
  const recipe_steps_payload = {
    recipe_id: recipe_and_ingredients.recipe.recipe_id,
    instruction: recipe_payload.instruction
  }
  const recipe_steps = await recipeStepsService.addRecipeSteps(recipe_steps_payload)
  logger.info(`Added recipe with ingredients: ${JSON.stringify(recipe_and_ingredients)}`);
  return resp.json (new StandardResponse(true, 'Recipe added successfully', {"cuisine_id": cuisine_id, "recipe": recipe_and_ingredients.recipe, "ingredients": recipe_and_ingredients.ingredients, "recipe_steps": recipe_steps}))
  }catch(err) {
    next(err)
  }
})

router.get('/recipes', async (req, resp, next) => {
  try{
    const recipesService = getRecipesService()
    const { search = null, page = 1, limit = 10 } = req.query
    const recipes = await recipesService.getAllRecipes({searchStr: search, page: parseInt(page), limit: parseInt(limit)})
    return resp.json(new StandardResponse(true, 'All recipes fetched successfully', {page, limit, recipes})) 
  } catch (error) {
    next(error)
  }
})

router.get('/recipe/:recipe_id', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  try{
    const recipeService = getRecipesService();
    const recipe_id = Number(req.params.recipe_id);
    if (!recipe_id || isNaN(recipe_id)){
      return next(new ValidationError("Invalid recipe_id", 400, "VALIDATION_ERROR"));
    }
    const recipe = await recipeService.getRecipeById(recipe_id)
    return res.json(new StandardResponse(true, "Recipe fetched successfully", {Recipe: recipe}));
  } catch (err) {
    next(err);
  }
})

router.get('/recipe-steps/:recipe_id', allowedEntities(EntityType.ADMIN), async (req, res, next) => {
  try{
    const recipeStepsService = getRecipeStepsService();
    const recipe_id = Number(req.params.recipe_id);
    if (!recipe_id || isNaN(recipe_id)) {
      return next(new ValidationError("Invalid recipe id", 400, "VALIDATION_ERROR"))
    }
    const recipe_steps = await recipeStepsService.getRecipeStepsByRecipeId(recipe_id)
    return res.json(new StandardResponse(true, "Recipe steps fetched successfully", {"recipe_steps": recipe_steps}))
  }catch(err) {
    next(err)
  }
})

router.put('/recipe/:recipe_id', allowedEntities(EntityType.ADMIN), async (req, resp, next) => {
  try{
    const recipeService = getRecipesService();
    const recipeStepsService = getRecipeStepsService();
    const { error, value} =  recipeUpdateSchema.validate(req.body)

    if (error) {
      return next (new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details))
    }

    const recipe_id = Number(req.params.recipe_id);
    if (!recipe_id || isNaN(recipe_id)){
      return next(new ValidationError("Invalid recipe_id", 400, "VALIDATION_ERROR"));
    }

    if (value.prep_time === undefined && value.instruction === undefined) {
      return next(new ValidationError("At least one field (prep_time, instruction, cuisine_name) must be provided", 400, "VALIDATION_ERROR"));
    }

    let updatedRecipe = null;
    let recipe_steps_result = null;

    const updatePayload = {};
    if (value.instruction !== undefined && value.instruction !== null) {
        updatePayload.instruction = value.instruction;
    }
    if (value.prep_time !== undefined && value.prep_time !== null) {
      updatePayload.prep_time = `${value.prep_time} mins`;
    }
    updatedRecipe = await recipeService.updateRecipe(recipe_id, updatePayload)
    if (value.instruction){
      recipe_steps_result = await recipeStepsService.updateRecipeSteps(recipe_id, value.instruction)
    }
    const response = {}
    if (updatedRecipe) {
      response.updatedRecipe = updatedRecipe
    }
    if (recipe_steps_result){
      response.updatedRecipeSteps = recipe_steps_result
    }
    return resp.json(new StandardResponse(true, "recipe updated successfully",response))
  } catch(err){
    next(err)
  }
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

export default router;