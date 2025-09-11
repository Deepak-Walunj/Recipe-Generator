const {InvalidCredentialsError, DuplicateRequestException} = require('../core/exception');
const { EntityRegisterSchema } = require('../schemas/authSchema');
const { AuthEntitySchema } = require('../models/authModel');
const { create_access_token, create_refresh_token, hash_password, verify_password } = require('../middleware/security');
const { v4: uuidv4 } = require("uuid");
const { setupLogging, getLogger } = require('../core/logger');
const bcrypt = require('bcrypt');

setupLogging();
const logger = getLogger("auth-service");
class AuthService {
    constructor({ authRepository, cacheClient }) {
        this.authRepository = authRepository;
        this.cache = cacheClient;
    }
    async registerEntity(data) {
        const { error, value } = EntityRegisterSchema.validate({
            name: data.name,
            email: data.email,
            password: data.password,
            entity_type: data.entity_type
        });
        if (error) {
            throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
        }
        const existingUser = await this.authRepository.findByEmail(data.email, data.entity_type);
        if (existingUser) {
            throw new DuplicateRequestException('User already exists', 409, 'DUPLICATE_USER', { email: data.email });
        }
        // const hashedPassword = await hash_password(value.password);
        const auth_user = AuthEntitySchema.validate({
            userId:uuidv4(),
            email: value.email,
            hashed_password: value.password, 
            entity_type: value.entity_type
        }, { stripUnknown: true });
        const newUser = await this.authRepository.createAuthEntity(auth_user.value);
        return newUser;
    }
    
    async loginEntity(data) {
        const user = await this.authRepository.findByEmail(data.email, data.entity_type);
        if (!user) {
            logger.info(`No user found for email: ${data.email}`);
            return null;
        }
        // const isPasswordValid = await verify_password(data.password, user.hashed_password);
        // if (!isPasswordValid) {
        if (data.password !== user.hashed_password) {
            logger.info(`Incorrect password for email: ${data.email}`);
            return null;
        }
        if (user.entity_type !== data.entity_type) {
            logger.info(
                `Entity type mismatch for email: ${data.email}, expected: ${user.entity_type}, received: ${data.entity_type}`
            );
            return null;
        }
        return user;
    }

    async generateTokens(user) {
        const auth_entity = AuthEntitySchema.validate(user, { stripUnknown: true });
        if (auth_entity.error) {
            throw new InvalidCredentialsError('Invalid user data', 400, 'INVALID_USER', auth_entity.error.details);
        }
        const data = {
            userId: user.userId,
            email: user.email,
            entity_type: user.entity_type
        }
        const access_token=create_access_token(data);
        const refresh_token=create_refresh_token(data);
        return { access_token, refresh_token  };
    }

    async get_user_by_id(userId) {
        let user = await this.cache.get(userId)
        if (user) {
            return JSON.parse(user)
        }
        user = await this.authRepository.findById(userId);
        if (user) {
            await this.cache.set(userId, JSON.stringify(user),{ EX: 60*5 }) // Cache for 1 hour
        }
        return user;
    }

    async deleteEntityByEntityId(entityId) {
        const result = await this.authRepository.deleteByUserId(entityId);
        return result;
    }
}

module.exports = AuthService;