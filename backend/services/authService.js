import { InvalidCredentialsError, ValidationError, UnauthorizedError, NotFoundError, DuplicateRequestException } from '../core/exception.js';
import { AuthEntityModel, AuthEntityFields } from '../models/authModel.js';
import { UserProfileModel } from '../models/userModel.js';import { create_access_token, create_refresh_token, verify_refresh_token, hash_password, verify_password, generate_verification_token, verifyEmail } from '../middleware/security.js';
import { setupLogging, getLogger } from '../core/logger.js';
import { sendVerificationEmail } from '../client/resendMailer.js';import { EntityType } from '../core/enum.js';

setupLogging();
const logger = getLogger("auth-service");
class AuthService {
    constructor({ authRepository, cacheClient, userRepository }) {
        this.authRepository = authRepository;
        this.userRepository = userRepository;
        this.cache = cacheClient;
    }

    async generateUniqueDemoUsername(){
        let username
        let exists = true
        while(exists){
            const random = Math.random().toString(36).substring(2,8)
            username = `User_${random}`
            const user = await this.authRepository.getUserByName()
            logger.info(user)
            if (!user) exists = false
        }
        return username
    }

    async registerEntity(data) {
        if (data.entity_type !== EntityType.DEMO_USER){
            const existingUser = await this.authRepository.findByEmail(data.email);
            if (existingUser) {
                if (!existingUser.is_verified) {
                    await this.resendVerificationToken(existingUser.email, existingUser.entity_type)
                    return { email_verification_token: null, message: "User already exists but not verified. Verification email resent."}
                }
                throw new DuplicateRequestException("User already exists")
            }
            const password = await hash_password(data.password);
            const {error, value} = AuthEntityModel.validate({
                username: data.username,
                email: data.email,
                password: password, 
                entity_type: data.entity_type,
                is_verified: false
            }, { stripUnknown: true, convert: true });
            if (error) {
                throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
            }
            logger.info(`Creating user in auth table with username: ${JSON.stringify(value.username)}`)
            const newUser = await this.authRepository.createAuthEntity(value);
            const email_verification_token = generate_verification_token({ entity_type: newUser.entity_type, email: newUser.email, user_id: newUser.entity_id})
            await sendVerificationEmail(newUser.email, email_verification_token)
            return {email_verification_token: email_verification_token, message: "Verification email sent", data: newUser}
        }else if (data.entity_type === EntityType.DEMO_USER){
            const username = await this.generateUniqueDemoUsername()
            const {error, value} = AuthEntityModel.validate({
                username: username,
                entity_type: data.entity_type,
                is_verified: false,
                expires_at: new Date(Date.now() + 24*60*60*1000)
            })
            if (error) {
                throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
            }
            logger.info(`Creating demo entity in auth table with username: ${JSON.stringify(value.username)}`)
            const newUser = await this.authRepository.createAuthEntity(value);
            return {email_verification_token: null, message: "Demo user registered in auth repo", data: newUser}
        }
    }

    async resendVerificationToken(email, entity_type) {
        const user = await this.authRepository.findByEmail(email)
        if (!user) {
            throw new Error("User not found")
        }
        if (user.is_verified) {
            return {email_verification_token: null, message: "Email already verified, try to login", already_verified: true}
        }
        const email_verification_token = generate_verification_token({entity_type: entity_type, email: email, user_id: user.user_id})
        await sendVerificationEmail(email, email_verification_token, entity_type)
        return {email_verification_token: email_verification_token, message: "Verification token sent successfully", already_verified: false}
    }

    async verifyEmailByToken(token) {
        try{
            const decoded = verifyEmail(token)
            logger.info(`Decoded token after verification: ${JSON.stringify(decoded)}`)
            const user = await this.authRepository.findByEmail(decoded.email)
            if (!user) {
                throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', {email: decoded.email});
            }
            if (user.is_verified) {
                logger.info("User already verified")
                return {email: decoded.email, entity_type: decoded.entity_type, already_verified: true, message: "User already verified", status: "verified"}
            }
            if (user.entity_type !== decoded.entity_type){
                throw new ValidationError("Entity type missmatch", 400, 'VALIDATION_ERROR')
            }
            const {error, value} = UserProfileModel.validate({
                user_id: decoded.user_id,
                username: user.username,
                email: user.email,
                users_type: user.entity_type
            }, { stripUnknown: true });
            if (error) {
                throw new InvalidCredentialsError(error.message, 400, 'VALIDATION_ERROR', error.details);
            }
            let entity = await this.userRepository.findUserByEmailAndEntityType(value.email, value.users_type);
            // if (entity){
            //     throw new DuplicateRequestException("User already exists", 409, "DUPLICATE_REQUEST", value.email)
            // }
            if (!entity) {
                const profile = await this.userRepository.createUserProfile(value);
                logger.info(`Created user profile = ${JSON.stringify(profile)}`);
                entity = profile
            }
            await this.authRepository.updateVerificationStatus(decoded.email, true)
            return {email: entity.email, entity_type: entity.users_type, already_verified:false, message: "User verified successfully", status: "success"}
        } catch (error) {
            logger.error(error)
            throw new ValidationError(error.message, 400, 'VALIDATION_ERROR')
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
        if (!user.is_verified) {
            throw new ValidationError("Please verify your email before logging in", 403, "EMAIL_NOT_VERIFIED")
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

export default AuthService;