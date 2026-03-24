const { EntityType } = require("../core/enum");
const { DuplicateRequestException, MissingRequiredFields, NotFoundError } = require("../core/exception");
const { setupLogging, getLogger } = require('../core/logger');
const { AuthEntityFields } = require("../models/authModel");

setupLogging();
const logger = getLogger("auth-repo");
class AuthRepository {
    constructor(collection) {
        this.collection = collection;
    }

    async getUserByName(name) {
        return this.collection.findOne({[AuthEntityFields.USERNAME]: name})
    }

    async findByEmail(email) {
        return this.collection.findOne({[AuthEntityFields.EMAIL]: email});
    }

    async createAuthEntity(data){
        if (data.entity_type !== EntityType.DEMO_USER){
            const required_fields = ['password', 'entity_type']
            const missing_fields = required_fields.filter(field => !(field in data));
            if (missing_fields.length > 0) {
                throw new MissingRequiredFields('Missing required fields', 400, 'MISSING_FIELDS', missing_fields);
            }
            try{
            const result = await this.collection.insertOne(data);
            return { ...data};
            }catch(err){
                throw err;
            }
        }else if (data.entity_type === EntityType.DEMO_USER){
            const result = await this.collection.insertOne(data);
            return {...data, demo_id: result.insertedId}
        }
    }

    async updateVerificationStatus(email, is_verified) {
        const result = await this.collection.updateOne(
            {[AuthEntityFields.EMAIL]: email},
            { [AuthEntityFields.IS_VERIFIED]: is_verified }
        );
        if (result.affectedRows === 0){
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {user_id});
        }
    }

    async findById(userId) {
        const result = await this.collection.findOne({[AuthEntityFields.userId] : userId }) // lean() for plain object
        if (!result) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {userId});
        }
        return result;
    }

    async deleteByEmail(email) {
        const result = await this.collection.deleteOne({ [AuthEntityFields.EMAIL]: email });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { email });
        }
        return true;
    }
    async deleteById(id) {
        const result = await this.collection.deleteOne({ [AuthEntityFields.USER_ID]: id });
        if (result.deletedCount === 0) {
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { id });
        }
        return true;
    }

    async updateEntityDetails(user_id, entity_type, payload){
        const result = await this.collection.updateOne({
            [AuthEntityFields.USER_ID]: user_id,
            [AuthEntityFields.ENTITY_TYPE]: entity_type
        },
        payload
        )
        if (result.affectedRows === 0){
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {user_id});
        }
    }
}

module.exports = AuthRepository;