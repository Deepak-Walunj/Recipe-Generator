import { InvalidCredentialsError } from '../core/exception.js';
import { setupLogging, getLogger } from '../core/logger.js';
import { EntityType, AuthProvider } from '../core/enum.js';
import { UserProfileModel } from '../models/userModel.js';

setupLogging();
const logger = getLogger("user-service");

class UserService {
    constructor({ userRepository, auth_service }) {
        this.userRepository = userRepository;
        this.auth_service = auth_service;
    }

    async getUserProfile(email) {
        return await this.userRepository.findUserByEmail(email);
    }

    async deleteUser(email) {
        const result = await this.auth_service.deleteEntityByEmail(email);
        if (!result) {
            logger.info(`Unable to delete profile with email: ${email}`)
        }
        return await this.userRepository.deleteUserByemail(email);
    }
}

export default UserService;