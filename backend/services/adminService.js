const { setupLogging, getLogger } = require('../core/logger')
const { EntityProfileSchema } = require('../models/authModel');
const { InvalidCredentialsError,  DuplicateRequestException } = require('../core/exception')


setupLogging();
const logger = getLogger('admin-service')

class AdminService {
    constructor({ userRepository, auth_service, user_service }) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
        this.user_service = user_service;
    }

    async registerAdmin(data) {
        const { error, value } = EntityProfileSchema.validate({
            username: data.username,
            email: data.email,
            password: data.password,
            users_type: data.entity_type
        }, { stripUnknown: true });
        logger.info("Verification successfull")
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
            entity_type: data.entity_type   // keep entity_type naming for auth table
        };
        const admin = await this.auth_service.registerEntity(authPayload)
        logger.info(`Creating admin profile with data: ${JSON.stringify(value)}`);
        return admin
    }

    async getAdminProfile(email) {
        return await this.userRepository.findUserByEmail( email );
    }

    async deleteUser(email) {
        const result = await this.auth_service.deleteEntityByEmail(email);
        if (!result){
            logger.info(`Unable to delete profile with email: ${email}`)
        }
        return await this.userRepository.deleteUserByemail(email);
    }

    async getAllUsers({searchStr = null, page = 1, limit = 10 }) {
        const users = await this.userRepository.getAllUsers({
            searchStr, page, limit
        });
        return users
    }
}

module.exports = AdminService;