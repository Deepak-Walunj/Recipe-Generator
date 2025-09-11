const { DuplicateRequestException, MissingRequiredFields, NotFoundError } = require("../core/exception");
const { setupLogging, getLogger } = require('../core/logger');
const { AuthEntityFields } = require("../models/authModel");

setupLogging();
const logger = getLogger("auth-repo");
class AuthRepository {
    constructor(collection) {
        this.collection = collection;
    }

    async findByEmail(email, entity_type) {
        const result = this.collection.findOne({[AuthEntityFields.email]: email, [AuthEntityFields.entity_type]: entity_type});
        if (!result){
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {email, entity_type});
        }
        return result;
    }

    async createAuthEntity(data){
        const required_fields = ['hashed_password', 'entity_type']
        const missing_fields = required_fields.filter(field => !(field in data));
        if (missing_fields.length > 0) {
        throw new MissingRequiredFields('Missing required fields', 400, 'MISSING_FIELDS', missing_fields);
        }
        try{
        const result = await this.collection.insertOne(data);
        return { ...data, _id: result.insertedId };
        }catch(err){
            if (err.code === 11000) {
                logger.error({ err }, "Duplicate email error");
                throw new DuplicateRequestException('User with this email already exists', 409, 'DUPLICATE_USER', err.keyValue);
            }
            throw err;
        }
    }

    async findById(userId) {
        const result = await this.collection.findOne({[AuthEntityFields.userId] : userId }) // lean() for plain object
        if (!result) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {userId});
        }
        return result;
    }

    async deleteByUserId(userId) {
        const result = await this.collection.deleteOne({ [AuthEntityFields.userId]: userId });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { userId });
        }
        return true;
    }
}

module.exports = AuthRepository;