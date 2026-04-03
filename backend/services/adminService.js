import { setupLogging, getLogger } from '../core/logger.js';
import { InvalidCredentialsError, DuplicateRequestException, NotFoundError } from '../core/exception.js';
import { AuthProvider } from '../core/enum.js';

setupLogging();
const logger = getLogger('admin-service')

class AdminService {
    constructor({ userRepository, auth_service, user_service }) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
        this.user_service = user_service;
    }

    async getAdminProfile(email) {
        return await this.userRepository.findUserByEmail(email);
    }

    async findUserbyId(id, entity_type) {
        const user = await this.userRepository.findUserbyId(id, entity_type);
        if (!user) {
            throw new NotFoundError("Entity not found", 401, 'NOT_FOUND', { "user_id": id, "Entity_type": entity_type })
        }
        return user
    }

    async deleteUser(email) {
        const result = await this.auth_service.deleteEntityByEmail(email);
        if (!result) {
            logger.info(`Unable to delete profile with email: ${email}`)
        }
        return await this.userRepository.deleteUserByemail(email);
    }

    async deleteUserbyId(admin_id) {
        const result = await this.auth_service.deleteEntityById(admin_id);
        if (!result) {
            logger.info(`Unable to delete profile with admin_id: ${admin_id}`)
        }
        return await this.userRepository.deleteUserById(admin_id);
    }

    async updateEntityDetails(data) {
        const existing_user = await this.userRepository.findUserByEmail(data.email)
        logger.info(`[Admin Service] Existing user details: ${JSON.stringify(existing_user)}`)
        if (!data.updated_name && !data.updated_password) {
            throw new InvalidCredentialsError(
                "Please provide name or password or email to update",
                400,
                "VALIDATION_ERROR"
            );
        }
        const updated_user = await this.userRepository.updateEntityDetails(existing_user.user_id, existing_user.users_type, {
            updated_name: data.updated_name ? data.updated_name : undefined,
            updated_password: data.updated_password ? data.updated_password : undefined,
        }
        );
        if (data.updated_password) {
            await this.auth_service.updateEntityDetails(existing_user.user_id, existing_user.users_type, {
                updated_password: data.updated_password
            })
        }
        if (updated_user) {
            return await this.findUserbyId(existing_user.user_id, existing_user.users_type)
        }
    }

    async getAllUsers({ searchStr = null, page = 1, limit = 10 }) {
        const users = await this.userRepository.getAllUsers({ searchStr: searchStr, page: page, limit: limit });
        return users
    }
}

export default AdminService;