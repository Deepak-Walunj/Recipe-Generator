const { getDB, connectDB} = require('./database')
const collections = require('./collections')
const { setupLogging, getLogger } = require('../core/logger');
const AuthRepository = require('../repositories/authRepository');
const UserRepository = require('../repositories/userRepository');
const AdminRepository = require('../repositories/adminRepository');
const { CACHE } = require('./settings');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const AdminService = require('../services/AdminService');
const logger = getLogger("deps");
const { createClient } = require("redis");
const { func } = require('joi');
setupLogging();
logger.info('In deps.js');

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
        this.userRepo = new UserRepository(db.collection(collections.USERS));
        this.authRepo = new AuthRepository(db.collection(collections.AUTH_USERS));
        this.adminRepo = new AdminRepository(db.collection(collections.ADMINS));
        
        this.authService = new AuthService({ authRepository: this.authRepo, cacheClient: this._cache });
        this.userService = new UserService({ userRepository: this.userRepo, auth_service: this.authService });
        this.adminService = new AdminService({ adminRepository: this.adminRepo, auth_service: this.authService, user_service: this.userService });
        }
    getAuthRepository() {
        return this.authRepo;
    }
    getUserRepository() {
        return this.userRepo;
    }
    getAdminRepository() {
        return this.adminRepo;
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
function getAdminRepository() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getAdminRepository();
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
function getCache() {
  if (!dependencyStorage) throw new Error('Dependencies not initialized');
  return dependencyStorage.getCache();
}
module.exports = {
  initializeDependencies,
  getAuthRepository,
  getUserRepository,
  getAdminRepository,
  getAuthService,
  getUserService,
  getAdminService,
  getCache
};
