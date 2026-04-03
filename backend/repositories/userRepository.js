import { setupLogging, getLogger } from '../core/logger.js';
import { UserProfileFields } from '../models/userModel.js';
import { NotFoundError, MissingRequiredFields } from '../core/exception.js';
import { EntityType } from '../core/enum.js';

setupLogging();
const logger = getLogger("user-repo");

class UserRepository {
    constructor(collection) {
        this.collection = collection;
    }

    async createUserProfile(data) {
        if (data.users_type !== EntityType.DEMO_USER) {
            try {
                const required_fields = ['email', 'users_type']
                const missing_fields = required_fields.filter(field => !(field in data));
                if (missing_fields.length > 0) {
                    throw new MissingRequiredFields('Missing required fields', 400, 'MISSING_FIELDS', missing_fields);
                }
                const payload = {
                    user_id: data.user_id,
                    username: data.username,
                    email: data.email,
                    users_type: data.users_type
                };
                const result = await this.collection.insertOne(payload);
                logger.info(`[UserRepo] Created user profile with ID: ${result.insertedId}`);
                return { ...payload, user_id: result.insertedId };
            } catch (err) {
                logger.error(`Error creating user profile: ${err.message}`);
                throw err;
            }
        } else if (data.users_type === EntityType.DEMO_USER) {
            const payload = {
                user_id: data.user_id,
                username: data.username,
                users_type: data.users_type
            }
            const result = await this.collection.insertOne(payload);
            return { ...data, demo_id: result.insertedId }
        }
    }

    async deleteUserByemail(email) {
        try {
            const result = await this.collection.deleteOne({ [UserProfileFields.EMAIL]: email });
            if (result.deletedCount === 0) {
                throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { email });
            }
            logger.info(`[UserRepo] Deleted user with email: ${email}`);
            return true;
        } catch (err) {
            logger.error(`Error deleting user with email ${email}: ${err.message}`);
            throw err;
        }
    }

    async deleteUserById(id) {
        try {
            const result = await this.collection.deleteOne({ [UserProfileFields.USER_ID]: id });
            if (result.deletedCount === 0) {
                throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { id });
            }
            logger.info(`[UserRepo] Deleted user with ID: ${id}`);
            return true;
        } catch (err) {
            logger.error(`Error deleting user with ID ${id}: ${err.message}`);
            throw err;
        }
    }

    async findUserByEmail(email) {
        const result = await this.collection.findOne({ [UserProfileFields.EMAIL]: email });
        logger.info(`[UserRepo] found user ${JSON.stringify(result)} with email: ${email}`)
        return result
    }

    async findUserByEmailAndEntityType(email, entity_type) {
        const result = await this.collection.findOne({
            [UserProfileFields.EMAIL]: email,
            [UserProfileFields.USERS_TYPE]: entity_type
        });
        logger.info(`[UserRepo] found user ${JSON.stringify(result)} with email: ${email} and entity_type: ${entity_type}`)
        return result
    }

    async findUserbyId(id, entity_type) {
        const result = await this.collection.findOne({
            [UserProfileFields.USER_ID]: id,
            [UserProfileFields.USERS_TYPE]: entity_type
        });
        logger.info(`[UserRepo] found user ${JSON.stringify(result)} with id: ${id}`)
        return result
    }

    async updateEntityDetails(user_id, users_type, updates) {
        const updatePayload = {}
        if (updates.updated_name) {
            updatePayload[UserProfileFields.USERNAME] = updates.updated_name
        }
        if (updates.updated_password) {
            updatePayload[UserProfileFields.PASSWORD] = updates.updated_password
        }
        const result = await this.collection.updateOne({
            [UserProfileFields.USER_ID]: user_id,
            [UserProfileFields.USERS_TYPE]: users_type
        },
            updatePayload
        )
        if (result.affectedRows === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { user_id });
        }
        logger.info(`[UserRepo] Updated user with ID: ${user_id}`);
        return true
    }

    async getAllUsers({ searchStr = null, page = 1, limit = 10 }) {
        let query = `SELECT user_id, username, email, users_type FROM users`;
        const params = [];
        if (searchStr && searchStr.trim() !== "") {
            query += ` WHERE username LIKE ? OR email LIKE ?`;
            params.push(`%${searchStr}%`, `%${searchStr}%`);
        }
        query += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number((page - 1) * limit));
        try {
            const [rows] = await this.collection.db.query(query, params);
            logger.info(`[UserRepo] Fetched users with searchStr: ${searchStr}, page: ${page}, limit: ${limit}`);
            return rows;
        } catch (err) {
            logger.error(`Error fetching users: ${err.message}`);
            throw err;
        }
    }

}

export default UserRepository;