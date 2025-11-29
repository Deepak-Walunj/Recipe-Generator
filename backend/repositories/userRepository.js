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

    async findUserByUserId(user_id) {
        const result = await this.collection.findOne({ [UserProfileFields.USER_ID]: user_id });
        if (!result) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { user_id });
        }
        return result
    }

    async deleteUserByemail(email) {
        const result = await this.collection.deleteOne({ [UserProfileFields.EMAIL]: email });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { userId });
        }
        return true;
    }

    async findUserByEmail(email) {
        const result = await this.collection.findOne({ [UserProfileFields.EMAIL]: email });
        logger.info(`[UserRepo] found user ${JSON.stringify(result)} with email: ${email}`)
        return result
    }

    async getAllUsers({ searchStr = null, page = 1, limit = 10 }) {
        let query = `SELECT user_id, username, email FROM users`;
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