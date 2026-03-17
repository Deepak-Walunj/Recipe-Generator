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
        const authPayload = {
            username: data.username,
            email: data.email,
            password: data.password,
            entity_type: data.entity_type 
        };
        return await this.auth_service.registerEntity(authPayload)
    }

    async getUserProfile(email) {
        return await this.userRepository.findUserByEmail(email);
    }

    async deleteUser(email) {
        const result = await this.auth_service.deleteEntityByEmail(email);
        if (!result){
            logger.info(`Unable to delete profile with email: ${email}`)
        }
        return await this.userRepository.deleteUserByemail(email);
    }
}

module.exports = UserService;