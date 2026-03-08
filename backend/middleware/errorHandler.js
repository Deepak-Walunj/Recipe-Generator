const { AppError } = require('../core/exception');
const { setupLogging, getLogger } = require('../core/logger');

setupLogging();
const logger = getLogger("errorHandler");
logger.info('In errorHandler.js');

// Handles custom AppError exceptions
function appExceptionHandler(err, req, res, next) {
  if (err instanceof AppError) {
    logger.error({ errName: err.name, err }, 'App exception');
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error_code: err.errorCode,
      details: err.details,
    });
  }
  next(err);
}

// Handles validation errors (Joi, Zod, etc.)
function validationExceptionHandler(err, req, res, next) {
  if (err.isJoi) {
    logger.error('Validation exception', { err });
    const details = err.details.map(d => ({
      field: d.path.join(' -> '),
      message: d.message,
      type: d.type
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error_code: 'VALIDATION_ERROR',
      details,
    });
  }
  next(err);
}

// Handles unhandled errors
function genericExceptionHandler(err, req, res, next) {
  const response = {
    success: false,
    message: 'Internal server error',
    error_code: 'INTERNAL_SERVER_ERROR',
  };
  response.details = {
    type: err.name,
    message: err.message,
    stack: err.stack,
  };
  logger.error({ errName: err.name, err }, 'Unhandled exception');
  res.status(500).json(response);
}


module.exports = {
  appExceptionHandler,
  validationExceptionHandler,
  genericExceptionHandler,
};