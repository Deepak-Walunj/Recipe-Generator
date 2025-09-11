const { EntityProfileSchema } = require('../models/authModel');
const { InvalidCredentialsError } = require('../core/exception');
const { setupLogging, getLogger } = require('../core/logger');

setupLogging();
const logger = getLogger("user-service");

class UserService {
    constructor({userRepository, auth_service}) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
    }

    async registerUser(data){
    const user = await this.auth_service.registerEntity(data);
    const {error, value} = EntityProfileSchema.validate({
        userId: user.userId,
        full_name: data.name,
        email: data.email,
    }, { stripUnknown: true });
    if (error) {
        throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
    }
    const profile = await this.userRepository.createProfile(value);
    return profile
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