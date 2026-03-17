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
        const entity = await this.userRepository.findUserByEmailAndEntityType(value.email, value.users_type);
        if (entity){
            throw new DuplicateRequestException("User already exists", 409, "DUPLICATE_REQUEST", value.email)
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
        const email_verification_token = await this.auth_service.registerEntity(authPayload)
        logger.info(`Creating user profile with data: ${JSON.stringify(value)}`);
        return email_verification_token
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