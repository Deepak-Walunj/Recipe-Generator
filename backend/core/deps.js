const { createClient } = require("redis");

const MySQLCollection = require("./mysqlCollection");
const { getDB, connectDB} = require('./database')
const collections = require('./collections')
const { CACHE } = require('./settings');
const { setupLogging, getLogger } = require('./logger');

const AuthRepository = require('../repositories/authRepository');
const UserRepository = require('../repositories/userRepository');
const IngredientsRepository = require('../repositories/ingredientsRepository');
const CuisinesRepository = require('../repositories/cuisinesRepository')

const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const AdminService = require('../services/adminService');
const IngredientsService = require('../services/ingredientsService');
const CuisinesService = require('../services/cuisines')

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

class DependencyStorage{
    constructor(db, cache){
        if (!db) logger.error('Database not initialized');
        this._cache = cache 
        this.userRepo = new UserRepository(new MySQLCollection(db, collections.USERS));
        this.authRepo = new AuthRepository(new MySQLCollection(db, collections.AUTH_USERS));
        this.ingredientsRepo = new IngredientsRepository(new MySQLCollection(db, collections.INGREDIENTS))
        this.cusinesRepo = new CuisinesRepository(new MySQLCollection(db, collections.CUISINES))
        
        this.authService = new AuthService({ authRepository: this.authRepo, cacheClient: this._cache });
        this.userService = new UserService({ userRepository: this.userRepo, auth_service: this.authService });
        this.adminService = new AdminService({ userRepository: this.userRepo, auth_service: this.authService, user_service: this.userService });
        this.ingredientsService = new IngredientsService( { ingredientsRepository: this.ingredientsRepo })
        this.cuisinesService = new CuisinesService( { cuisinesRepository: this.cusinesRepo })
        }
    getAuthRepository() {
        return this.authRepo;
    }
    getUserRepository() {
        return this.userRepo;
    }
    getIngredientsRepository(){
      return this.ingredientsRepo;
    }
    getCusinesRepository(){
      return this.cusinesRepo;
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
    getIngredientsService(){
      return this.ingredientsService
    }
    getCuisinesService(){
      return this.cuisinesService
    }
    getCache() {
        return this._cache;
    }
}

async function initializeDependencies() {
  await connectDB();
  const db = getDB();
  let cache;
  if (CACHE) {
    const redisClient = createClient();
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    await redisClient.connect();
    cache = redisClient;
    logger.info('Using Redis for caching');
  }else{
    cache = new InMemoryCache();
    logger.info('Using in-memory cache');
  }
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
function getIngredientsRepository(){
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getIngredientsRepository();
}
function getCusinesRepository(){
  if (!dependencyStorage) throw new Error('Dependencies not initialised');
  return dependencyStorage.getCusinesRepository();
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
function getIngredientsService(){
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getIngredientsService();
}
function getCuisinesService(){
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getCuisinesService();
}
function getCache() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getCache();
}
module.exports = {
  initializeDependencies,
  getAuthRepository,
  getUserRepository,
  getIngredientsRepository,
  getCusinesRepository,
  getAuthService,
  getUserService,
  getAdminService,
  getIngredientsService,
  getCuisinesService,
  getCache
};
