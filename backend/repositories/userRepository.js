const { setupLogging, getLogger } = require('../core/logger');
const { UserProfileFields, UserProfileSchema } = require('../models/userModel');
const { UnprocessableEntityError, NotFoundError } = require('../core/exception');
setupLogging();
const logger = getLogger("user-repo");

class UserRepository {
    constructor(collection) {
        this.collection = collection;
    }

    async createUserProfile(userData){
        // ensure column names match DB: username, email, password, user_type
        const payload = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            users_type: userData.users_type    // note: user_type (not users_type)
        };
        const result = await this.collection.insertOne(payload);
        // result.insertedId is the auto-increment user_id
        return { ...payload, user_id: result.insertedId };
    }

    async findAdminByAdminId(adminId) {
        const result = await this.collection.findOne({ [AdminProfileFields.adminId]: adminId });
        if (!result) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { adminId });
        }
        const { error, value } = AdminProfileSchema.validate(result, { stripUnknown: true });
        if (error) {
            throw new UnprocessableEntityError(error.message, 422, 'UNPROCESSIBLE_ENTITY', error.details);
        }
        return value;
    }

    async deleteAdminByAdminId(adminId) {
        const result = await this.collection.deleteOne({ [AdminProfileFields.adminId]: adminId });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { adminId });
        }
        return true;
    }

    // async findByEmail(email) {
    //     return await this.UserModel.findOne({ email });
    // }

    async findUserByUserId(userId) {
        const result = await this.collection.findOne({ [UserProfileFields.userId]: userId });
        if (!result) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { userId });
        }
        const { error, value } = UserProfileSchema.validate(result, { stripUnknown: true });
        if (error) {
            throw new UnprocessableEntityError(error.message, 422, 'UNPROCESSIBLE_ENTITY', error.details);
        }
        return value;
    }

    async deleteUserByUserId(userId) {
        const result = await this.collection.deleteOne({ [UserProfileFields.userId]: userId });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { userId });
        }
        return true;
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