import express from 'express';
const router = express.Router();
import { setupLogging, getLogger } from '../core/logger.js';
import { getUserService } from '../core/deps.js';
import { ValidationError } from '../core/exception.js';import { registerUserSchema } from '../schemas/userSchema.js';
import { StandardResponse } from '../schemas/adminSchema.js';
import { allowedEntities } from '../middleware/authMiddleware.js';import { EntityType } from '../core/enum.js';setupLogging();
const logger = getLogger("user-router");

router.post('/register', async (req, res, next) => {
  const userService = getUserService()
  const { error, value } = registerUserSchema.validate(req.body);
  if (error){
    return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', error.details));
  }
  const resp = await userService.registerUser(value);
  return res.json(new StandardResponse(true, resp.message, {"email_verification_token": resp.email_verification_token}))
});

router.get('/me', allowedEntities(EntityType.USER), async (req, res, next) => {
  const userService = getUserService();
  const email = req.user.email
  const profile = await userService.getUserProfile(email)
  logger.info(`Fetched profile for user: ${profile}`);
  return res.json(new StandardResponse(true, 'User profile fetched successfully', profile))
})

router.delete('/me', allowedEntities(EntityType.USER), async (req, res, next) => {
  const userService = getUserService()
  const email = req.user.email
  const result = await userService.deleteUser(email)
  if (!result){
    logger.error(`Failed to delete user with ID: ${email}`);
  }
  logger.info(`Deleted user with email: ${email}`);
  return res.json(new StandardResponse(true, 'User deleted successfully', {"email": email}))
})

export default router;