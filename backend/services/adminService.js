const { setupLogging, getLogger } = require('../core/logger')
const { EntityProfileSchema } = require('../models/authModel');
const { InvalidCredentialsError } = require('../core/exception')

setupLogging();
const logger = getLogger('admin-service')

class AdminService {
    constructor({ adminRepository, auth_service, user_service }) {
        this.adminRepository = adminRepository;
        this.auth_service = auth_service;
        this.user_service = user_service;
    }

    async registerAdmin(data) {
        const admin = await this.auth_service.registerEntity(data)
        const { error, value } = EntityProfileSchema.validate({
            userId: admin.userId,
            full_name: data.name,
            email: data.email,
        }, { stripUnknown: true });
        if (error) {
            throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
        }
        logger.info(`Creating admin profile with data: ${JSON.stringify(value)}`);
        const profile = await this.adminRepository.createProfile(value);
        return profile
    }

    async getAdminProfile(adminId) {
        const profile = await this.adminRepository.findAdminByAdminId( adminId );
        return profile;
    }

    async deleteUser(adminId) {
        const admin = await this.adminRepository.findAdminByAdminId(adminId);
        const result_authRepo = await this.auth_service.deleteEntityByEntityId(admin.adminId);
        const result_adminRepo = await this.adminRepository.deleteAdminByAdminId(admin.adminId);
        return result_authRepo === result_adminRepo;
    }

    async getAllUsers({
        searchStr = null,
        page = 1,
        limit = 10
    }) {
        const users = await this.user_service.getAllUsers({
            searchStr, page, limit
        });
        return users
    }
}

module.exports = AdminService;