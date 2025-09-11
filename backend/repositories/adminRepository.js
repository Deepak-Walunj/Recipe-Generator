const { setupLogging, getLogger } = require('../core/logger')
const { AdminProfileSchema, AdminProfileFields } = require('../models/adminModel')
const { UnprocessableEntityError, NotFoundError } = require('../core/exception');
const { USERS } = require('../core/collections');

setupLogging()
const logger = getLogger('admin-repo')

class AdminRepository{
    constructor(collection){
        this.collection = collection;
    }

    async createProfile(adminData){
        const result = await this.collection.insertOne(adminData);
        return { ...adminData, _id: result.insertedId }
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
}

module.exports = AdminRepository;