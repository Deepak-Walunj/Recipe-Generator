const { EntityProfileSchema } = require('../models/authModel');
const { InvalidCredentialsError, DuplicateRequestException } = require('../core/exception');
const { setupLogging, getLogger } = require('../core/logger');

setupLogging();
const logger = getLogger("user-service");

class UserService {
    constructor({userRepository, auth_service}) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
    }

    async registerUser(data){
        const {error, value} = EntityProfileSchema.validate({
            username: data.username,
            email: data.email,
            password: data.password,
            users_type: data.entity_type
        }, { stripUnknown: true });
        if (error) {
            throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
        }
        const entity = await this.userRepository.findUserByEmail(value.email);
        if (entity){
            throw new DuplicateRequestException("Duplicate entry", 409, "DUPLICATE_REQUEST", value.email)
        }
        const profile = await this.userRepository.createUserProfile(value);
        const userId = profile.user_id
        logger.info(`Created user profile with user_id=${userId}`);
        const authPayload = {
            user_id: userId,
            email: value.email,
            password: value.password,
            entity_type: data.entity_type 
        };
        const user = await this.auth_service.registerEntity(authPayload);
        logger.info(`Creating user profile with data: ${JSON.stringify(value)}`);
        return user
    }

    async getUserProfile(userId) {
        const profile = await this.userRepository.findUserByUserId( userId );
        return profile;
    }

    async deleteUser(userId) {
        const user = await this.userRepository.findUserByUserId(userId);
        const result_authRepo = await this.auth_service.deleteEntityByEntityId(user.userId);
        const result_userRepo = await this.userRepository.deleteUserByUserId(user.userId);
        return result_authRepo === result_userRepo;
    }

    async getAllUsers({
        searchStr = null, page = 1, limit = 10
    }){
        const users = await this.userRepository.getAllUsers({
            searchStr, page, limit
        });
        return users
    }
}

module.exports = UserService;