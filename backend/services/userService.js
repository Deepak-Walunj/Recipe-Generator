const { InvalidCredentialsError } = require('../core/exception');
const { setupLogging, getLogger } = require('../core/logger');
const { EntityType } = require('../core/enum');
const { UserProfileModel } = require('../models/userModel');

setupLogging();
const logger = getLogger("user-service");

class UserService {
    constructor({userRepository, auth_service}) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
    }

    async registerUser(data){
        let authPayload = {}
        if (data.entity_type !== EntityType.DEMO_USER){
            authPayload = {
                username: data.username,
                email: data.email,
                password: data.password,
                entity_type: data.entity_type 
            };
            return await this.auth_service.registerEntity(authPayload)
        }else if (data.entity_type === EntityType.DEMO_USER){
            const response = await this.auth_service.registerEntity(data)
            const { error, value } = UserProfileModel.validate({
                user_id: response.data.demo_id,
                username: response.data.username,
                users_type: response.data.entity_type
            })
            if (error) {
                throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
            }
            logger.info(`Creating demo user in users table with data: ${JSON.stringify(value)}`)
            const user = await this.userRepository.createUserProfile(value)
            response.data = user
            return response
        }
        
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