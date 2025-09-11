const express = require('express');
const router = express.Router();
const { setupLogging, getLogger } = require('../core/logger');
const { getUserService } = require('../core/deps');
const { ValidationError } = require('../core/exception.js')
const { registerUserSchema } = require('../schemas/userSchema');
const { StandardResponse } = require('../schemas/adminSchema');
const allowedEntities = require('../middleware/authMiddleware')
const { EntityType } = require('../core/enum')

setupLogging();
const logger = getLogger("user-router");

router.post('/register', async (req, res, next) => {
  const userService = getUserService()
  const { error, value } = registerUserSchema.validate(req.body);
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details));
  }
  const user = await userService.registerUser(value);
  logger.info(`Registered new user: ${user}`);
  return res.json(new StandardResponse(true, 'User registered successfully', user))
});

router.get('/me', allowedEntities(EntityType.USER), async (req, res, next) => {
  const userService = getUserService();
  const userId = req.user.userId
  const profile = await userService.getUserProfile(userId)
  logger.info(`Fetched profile for user: ${profile}`);
  return res.json(new StandardResponse(true, 'User profile fetched successfully', profile))
})

router.delete('/me', allowedEntities(EntityType.USER), async (req, res, next) => {
  const userService = getUserService()
  const userId = req.user.userId
  const result = await userService.deleteUser(userId)
  if (!result){
    logger.error(`Failed to delete user with ID: ${userId}`);
  }
  logger.info(`Deleted user with ID: ${userId}`);
  return res.json(new StandardResponse(true, 'User deleted successfully'))
})

module.exports = router;