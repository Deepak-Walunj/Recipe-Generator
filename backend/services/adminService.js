const { setupLogging, getLogger } = require('../core/logger')
const { EntityProfileSchema } = require('../models/authModel');
const { InvalidCredentialsError,  DuplicateRequestException, NotFoundError } = require('../core/exception')

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

    async findUserbyId(id, entity_type) {
        const user = await this.userRepository.findUserbyId( id, entity_type );
        if (!user){
            throw new NotFoundError("Entity not found", 401, 'NOT_FOUND', details={"user_id": id, "Entity_type": entity_type})
        }
        return user
    }

    async deleteUser(email) {
        const result = await this.auth_service.deleteEntityByEmail(email);
        if (!result){
            logger.info(`Unable to delete profile with email: ${email}`)
        }
        return await this.userRepository.deleteUserByemail(email);
    }

    async deleteUserbyId(admin_id) {
        const result = await this.auth_service.deleteEntityById(admin_id);
        if (!result){
            logger.info(`Unable to delete profile with admin_id: ${admin_id}`)
        }
        return await this.userRepository.deleteUserById(admin_id);
    }

    async updateEntityDetails(data){
        const existing_user = await this.findUserbyId(data.id, data.entity_type)
        if (!data.updated_name && !data.updated_password  && !data.updated_email) {
            throw new InvalidCredentialsError(
                "Please provide name or password or email to update",
                400,
                "VALIDATION_ERROR"
            );
        }
        const updated_user = await this.userRepository.updateEntityDetails(existing_user.user_id, existing_user.users_type, {
                updated_name: data.updated_name,
                updated_email: data.updated_email,
                updated_password: data.updated_password
            }
        );
        if (data.updated_password || data.updated_email){
            await this.auth_service.updateEntityDetails(existing_user.user_id, existing_user.users_type, {
                updated_password: data.updated_password,
                updated_email: data.updated_email
            })
        }
        if (updated_user){
            return await this.findUserbyId(data.id, data.entity_type)
        }
    }

    async getAllUsers({searchStr = null, page = 1, limit = 10 }) {
        const users = await this.userRepository.getAllUsers({searchStr:searchStr, page:page, limit:limit});
        return users
    }
}

module.exports = AdminService;