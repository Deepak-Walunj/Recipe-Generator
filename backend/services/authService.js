const {InvalidCredentialsError, ValidationError, UnauthorizedError, NotFoundError} = require('../core/exception');
const { AuthRegisterSchema } = require('../schemas/authSchema');
const { AuthEntityModel, AuthEntityFields } = require('../models/authModel');
const { create_access_token, create_refresh_token, verify_refresh_token, hash_password, verify_password, generate_verification_token, verifyEmail } = require('../middleware/security');
const { setupLogging, getLogger } = require('../core/logger');
const { sendVerificationEmail } = require('../client/resendMailer')

setupLogging();
const logger = getLogger("auth-service");
class AuthService {
    constructor({ authRepository, cacheClient }) {
        this.authRepository = authRepository;
        this.cache = cacheClient;
    }
    async registerEntity(data) {
        const { error, value } = AuthRegisterSchema.validate({
            user_id: data.user_id,
            email: data.email,
            password: data.password,
            entity_type: data.entity_type
        });
        if (error) {
            throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
        }
        let existingUser = null;
        try {
            existingUser = await this.authRepository.findByEmail(value.email);
        } catch (err) {
            if (err.name !== 'NotFoundError') throw err;
        }
        const password = await hash_password(value.password);
        const auth_user = AuthEntityModel.validate({
            user_id: value.user_id,
            email: value.email,
            password: password, 
            entity_type: value.entity_type,
            is_verified: false
        }, { stripUnknown: true, convert: true });
        const newUser = await this.authRepository.createAuthEntity(auth_user.value);
        const email_verification_token = generate_verification_token({ user_id: newUser.user_id, email: newUser.email})
        await sendVerificationEmail(data.email, email_verification_token)
        return email_verification_token
    }

    async verifyEmailByToken(token) {
        try{
            const decoded = verifyEmail(token)
            logger.info(decoded)
            const user = await this.authRepository.findByEmail(decoded.email)
            if (!user) {
                throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {email: decoded.email});
            }
            if (user.is_verified) {
                return {message: "Email already verified"}
            }
            await this.authRepository.updateVerificationStatus(decoded.email, true)
            return {message: "Email verified successfully"}
        } catch (error) {
            throw new ValidationError("Something went wrong", 400, 'VALIDATION_ERROR', error.message)
        }
    }
    
    async loginEntity(data) {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user){
            throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {email: data.email, entity_type: data.entity_type});
        }
        if (user.entity_type !== data.entity_type) {
           throw new UnauthorizedError(`Invalid entity type, expected: ${user.entity_type}1`, 400, 'VALIDATION_ERROR', data.entity_type)
        }
        const isPasswordValid = await verify_password(data.password, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError("Incorrect Password! Ary Again", 400, 'VALIDATION_ERROR', data.password)
        }
        // if (data.password !== user.hashed_password) {
        //     logger.info(`Incorrect password for email: ${data.email}`);
        //     return null;
        // }
        return user;
    }

    async generateTokens(user) {
        const auth_entity = AuthEntityModel.validate(user, { stripUnknown: true, convert: true });
        if (auth_entity.error) {
            throw new InvalidCredentialsError('Invalid user data', 400, 'INVALID_USER', auth_entity.error.details);
        }
        const data = {
            userId: user.user_id,
            email: user.email,
            entity_type: user.entity_type
        }
        const access_token=create_access_token(data);
        const refresh_token=create_refresh_token(data);
        return { access_token, refresh_token  };
    }

    async validateRefreshTokenAndCreateAccessTokens(refreshToken) {
        logger.info(refreshToken)
        const payload = await verify_refresh_token(refreshToken)
        logger.info(payload)
        const user = await this.authRepository.findByEmail(payload.email)
        if (!user) {
            throw new UnauthorizedError("User not found", 401, "USER_NOT_FOUND", user);
        }
        return create_access_token({
            userId: payload.userId,
            email: payload.email,
            entity_type: payload.entity_type
        });
    }

    async get_user_by_email_in_cache(email) {
        let user = await this.cache.get(email)
        if (user) {
            return JSON.parse(user)
        }
        user = await this.authRepository.findByEmail(email);
        if (user) {
            await this.cache.set(email, JSON.stringify(user),{ EX: 60*5 }) // Cache for 1 hour
        }
        return user;
    }

    async get_user_by_email(email){
        return await this.authRepository.findByEmail(email);
    }

    async deleteEntityByEmail(email) {
        return await this.authRepository.deleteByEmail(email);
    }
    async deleteEntityById(id) {
        return await this.authRepository.deleteById(id);
    }

    async updateEntityDetails(user_id, entity_type, updates){
        const update_payload = {}
        if (updates.updated_password){
        const new_password = await hash_password(updates.updated_password);
        update_payload[AuthEntityFields.PASSWORD] = new_password
        }
        if (updates.updated_email){
        update_payload[AuthEntityFields.EMAIL] = updates.updated_email
        }
        await this.authRepository.updateEntityDetails(user_id, entity_type, update_payload)
    }
}

module.exports = AuthService;