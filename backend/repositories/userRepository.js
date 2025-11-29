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

    async deleteUserByUserId(userId) {
        const result = await this.collection.deleteOne({ [UserProfileFields.USER_ID]: userId });
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

    async getAllUsers({ searchStr = null, page = 1, limit = 10 }){
        const pipeline = []

        if (searchStr) {
            pipeline.push({
                $match: {
                    $or: [
                        {[UserProfileFields.full_name]: { $regex: searchStr, $options: 'i' }},
                        {[UserProfileFields.email]: { $regex: searchStr, $options: 'i' }},
                    ]
                }
            })
        }
        pipeline.push({$skip: (page-1)*limit})
        pipeline.push({$limit: limit})
        pipeline.push({
            $project: {
                _id: 0,
                [UserProfileFields.userId]: 1,
                [UserProfileFields.full_name]: 1,
                [UserProfileFields.email]: 1,
            }
        })
        try{
            const cursor = this.collection.aggregate(pipeline);
            const results = await cursor.toArray();
            return results
        }catch(err){
            logger.error(`Error fetching users: ${err.message}`);
            throw err;
        }
    }
}

module.exports = UserRepository;