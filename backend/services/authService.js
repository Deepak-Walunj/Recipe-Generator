const {InvalidCredentialsError, UnauthorizedError, NotFoundError} = require('../core/exception');
const { AuthRegisterSchema } = require('../schemas/authSchema');
const { AuthEntityModel } = require('../models/authModel');
const { create_access_token, create_refresh_token, hash_password, verify_password } = require('../middleware/security');
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
        const { error, value } = AuthRegisterSchema.validate({
            user_id: data.user_id,
            email: data.email,
            password: data.password,
            entity_type: data.entity_type
        });
        if (error) {
            throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
        }
        let existingUser = null;
        try {
            existingUser = await this.authRepository.findByEmail(value.email);
        } catch (err) {
            if (err.name !== 'NotFoundError') throw err;
        }
        const password = await hash_password(value.password);
        const auth_user = AuthEntityModel.validate({
            user_id: value.user_id,
            email: value.email,
            password: password, 
            entity_type: value.entity_type
        }, { stripUnknown: true });
        const newUser = await this.authRepository.createAuthEntity(auth_user.value);
        return newUser;
    }
    
    async loginEntity(data) {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user){
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {email: data.email, entity_type: data.entity_type});
        }
        if (user.entity_type !== data.entity_type) {
           throw new UnauthorizedError(`Invalid entity type, expected: ${user.entity_type}1`, 400, 'VALIDATION_ERROR', data.entity_type)
        }
        const isPasswordValid = await verify_password(data.password, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError("Incorrect Password! Ary Again", 400, 'VALIDATION_ERROR', data.password)
        }
        // if (data.password !== user.hashed_password) {
        //     logger.info(`Incorrect password for email: ${data.email}`);
        //     return null;
        // }
        return user;
    }

    async generateTokens(user) {
        const auth_entity = AuthEntityModel.validate(user, { stripUnknown: true });
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

    async get_user_by_email(email) {
        let user = await this.cache.get(email)
        if (user) {
            return JSON.parse(user)
        }
        user = await this.authRepository.findByEmail(email);
        if (user) {
            await this.cache.set(email, JSON.stringify(user),{ EX: 60*5 }) // Cache for 1 hour
        }
        return user;
    }

    async deleteEntityByEmail(email) {
        return await this.authRepository.deleteByEmail(email);
    }
    async deleteEntityById(id) {
        return await this.authRepository.deleteById(id);
    }
}

module.exports = AuthService;