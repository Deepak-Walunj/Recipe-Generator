import MySQLCollection from './mysqlCollection.js';
import { getDB, connectDB } from './database.js';
import collections from './collections.js';
import { setupLogging, getLogger } from './logger.js';

import AuthRepository from '../repositories/authRepository.js';
import UserRepository from '../repositories/userRepository.js';
import IngredientsRepository from '../repositories/ingredientsRepository.js';
import CuisinesRepository from '../repositories/cuisinesRepository.js';
import RecipesRepository from '../repositories/recipesRepository.js';
import RecipeStepsRepository from '../repositories/recipeStepsRepository.js';
import RecipeIngredientsRepository from '../repositories/recipeIngredientsRepository.js';
import AuthService from '../services/authService.js';
import UserService from '../services/userService.js';
import AdminService from '../services/adminService.js';
import IngredientsService from '../services/ingredientsService.js';
import CuisinesService from '../services/cuisinesService.js';
import RecipesService from '../services/recipesService.js';
import RecipeStepsService from '../services/recipeStepsService.js';
import RecipeIngredientsService from '../services/recipeIngredientsService.js';

setupLogging();
const logger = getLogger("deps");

let dependencyStorage = null;

class InMemoryCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, ttlSeconds) {
    this.store.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.store.delete(key), ttlSeconds * 1000);
    }
  }
}

class DependencyStorage {
  constructor(db, cache) {
    if (!db) logger.error('Database not initialized');
    this._cache = cache
    this.userRepo = new UserRepository(new MySQLCollection(db, collections.USERS));
    this.authRepo = new AuthRepository(new MySQLCollection(db, collections.AUTH_USERS));
    this.ingredientsRepo = new IngredientsRepository(new MySQLCollection(db, collections.INGREDIENTS))
    this.cusinesRepo = new CuisinesRepository(new MySQLCollection(db, collections.CUISINES))
    this.recipesRepo = new RecipesRepository(new MySQLCollection(db, collections.RECIPE))
    this.recipeStepsRepo = new RecipeStepsRepository(new MySQLCollection(db, collections.RECIPE_STEPS))
    this.recipeIngredientsRepo = new RecipeIngredientsRepository(new MySQLCollection(db, collections.RECIPE_INGREDIENTS))

    this.authService = new AuthService({ authRepository: this.authRepo, cacheClient: this._cache, userRepository: this.userRepo });
    this.userService = new UserService({ userRepository: this.userRepo, auth_service: this.authService });
    this.adminService = new AdminService({ userRepository: this.userRepo, auth_service: this.authService, user_service: this.userService });
    this.ingredientsService = new IngredientsService({ ingredientsRepository: this.ingredientsRepo })
    this.cuisinesService = new CuisinesService({ cuisinesRepository: this.cusinesRepo })
    this.recipesService = new RecipesService({ recipesRepository: this.recipesRepo, recipeIngredientsRepository: this.recipeIngredientsRepo })
    this.recipeStepsService = new RecipeStepsService({ recipeStepsRepository: this.recipeStepsRepo })
    this.recipeIngredientsService = new RecipeIngredientsService({ recipeIngredientsRepository: this.recipeIngredientsRepo })
  }
  getAuthRepository() {
    return this.authRepo;
  }
  getUserRepository() {
    return this.userRepo;
  }
  getIngredientsRepository() {
    return this.ingredientsRepo;
  }
  getCusinesRepository() {
    return this.cusinesRepo;
  }
  getRecipesRepository() {
    return this.recipesRepo;
  }
  getRecipeStepsRepository() {
    return this.recipeStepsRepo;
  }
  getRecipeIngredientsRepository() {
    return this.recipeIngredientsRepo;
  }
  getAuthService() {
    return this.authService;
  }
  getUserService() {
    return this.userService;
  }
  getAdminService() {
    return this.adminService;
  }
  getIngredientsService() {
    return this.ingredientsService
  }
  getCuisinesService() {
    return this.cuisinesService
  }
  getRecipesService() {
    return this.recipesService
  }
  getRecipeStepsService() {
    return this.recipeStepsService
  }
  getRecipeIngredientsService() {
    return this.recipeIngredientsService
  }
  getCache() {
    return this._cache;
  }
}

async function initializeDependencies() {
  await connectDB();
  const db = getDB();
  let cache;
  cache = new InMemoryCache();
  logger.info('Using in-memory cache');
  dependencyStorage = new DependencyStorage(db, cache);
}

function getAuthRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getAuthRepository();
}
function getUserRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getUserRepository();
}
function getIngredientsRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getIngredientsRepository();
}
function getCusinesRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getCusinesRepository();
}
function getRecipesRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getRecipesRepository();
}
function getRecipeStepsRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getRecipeStepsRepository();
}
function getRecipeIngredientsRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getRecipeIngredientsRepository();
}
function getAuthService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getAuthService();
}
function getUserService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getUserService();
}
function getAdminService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getAdminService();
}
function getIngredientsService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getIngredientsService();
}
function getCuisinesService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getCuisinesService();
}
function getRecipesService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getRecipesService();
}
function getRecipeStepsService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getRecipeStepsService();
}
function getRecipeIngredientsService() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getRecipeIngredientsService();
}
function getCache() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getCache();
}
export {
  initializeDependencies,
  getAuthRepository,
  getUserRepository,
  getIngredientsRepository,
  getCusinesRepository,
  getRecipesRepository,
  getRecipeStepsRepository,
  getRecipeIngredientsRepository,
  getAuthService,
  getUserService,
  getAdminService,
  getIngredientsService,
  getCuisinesService,
  getRecipesService,
  getRecipeStepsService,
  getRecipeIngredientsService,
  getCache
};
