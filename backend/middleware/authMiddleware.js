const jwt = require('jsonwebtoken');
const { SECRET_KEY, ALGORITHM } = require('../core/settings');
const { UnauthorizedError, ForbiddenError } = require('../core/exception');
const { setupLogging, getLogger } = require('../core/logger');
const { getAuthService } = require('../core/deps');

setupLogging();

const logger = getLogger('auth-middleware');

function allowedEntities(entity_type=null){
    return async(req, res, next) => {
        try{
            const authService = getAuthService()
            let token = null;
            if (req.cookies && req.cookies.access_token) {
                token = req.cookies.access_token;
            }else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                const [scheme, value] = req.headers.authorization.split(' ');
                token = value;
            }
            if (!token) {
                if (entity_type) {
                    return next(new UnauthorizedError("Not authenticated", 401, "UNAUTHORIZED"));
                }
                return next();
            }
            const payload = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
            const tokey_type = payload.token_type || payload.type;
            if (tokey_type !== 'access') {
                return next(new UnauthorizedError("Invalid token type", 401, "INVALID_TOKEN_TYPE"));
            }
            const userId = payload.userId;
            if (!userId) {
                return next(new UnauthorizedError("Invalid token payload", 401, "INVALID_TOKEN_PAYLOAD"));
            }
            const user = await authService.get_user_by_id(userId)
            if (!user) {
                return next(new UnauthorizedError("User not found", 401, "USER_NOT_FOUND", userId));
            }
            if (entity_type && user.entity_type !== entity_type) {
                return next(new ForbiddenError("You don't have permission", 403, "FORBIDDEN", payload.entity_type));
            }
            req.auth_payload = payload;
            req.user = user;
            next()
        }catch(err){
            if (err.name === "TokenExpiredError") {
                return next(new UnauthorizedError("Token expired", 401, "TOKEN_EXPIRED"));
            }
            return next(new UnauthorizedError("Invalid token", 401, "INVALID_TOKEN", err.message));
        }
    }
}

module.exports = allowedEntities;