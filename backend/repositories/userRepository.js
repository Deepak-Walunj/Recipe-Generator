const { setupLogging, getLogger } = require('../core/logger');
const { UserProfileFields } = require('../models/userModel');
const { NotFoundError } = require('../core/exception');
setupLogging();
const logger = getLogger("user-repo");

class UserRepository {
    constructor(collection) {
        this.collection = collection;
    }

    async createUserProfile(userData){
        const payload = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            users_type: userData.users_type   
        };
        const result = await this.collection.insertOne(payload);
        return { ...payload, user_id: result.insertedId };
    }

    async deleteUserByemail(email) {
        const result = await this.collection.deleteOne({ [UserProfileFields.EMAIL]: email });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { email });
        }
        return true;
    }

    async deleteUserById(id) {
        const result = await this.collection.deleteOne({ [UserProfileFields.USER_ID]: id });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { id });
        }
        return true;
    }

    async findUserByEmail(email) {
        const result = await this.collection.findOne({ [UserProfileFields.EMAIL]: email });
        logger.info(`[UserRepo] found user ${JSON.stringify(result)} with email: ${email}`)
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
            return rows;
        } catch (err) {
            logger.error(`Error fetching users: ${err.message}`);
            throw err;
        }
    }

}

module.exports = UserRepository;