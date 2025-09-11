// index.js
const express = require('express');
const cors = require('cors');
const { PORT, ALLOWED_ORIGINS } = require('./core/settings');
const {disconnectDB } = require('./core/database');
const { initializeDependencies } = require('./core/deps');
const { appExceptionHandler, validationExceptionHandler, genericExceptionHandler} = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const { setupLogging, getLogger } = require('./core/logger');

// Routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
// const interviewRouter = require('./routes/interviewRoutes');
// const dashboardRouter = require('./routes/dashboardRoutes');

(async function main() {
  const app = express();
  setupLogging();
  const logger = getLogger("main");
  logger.info('Starting Backend (Express)');

  try {
    // Connect DB & init dependencies
    await initializeDependencies();
    logger.info('Dependencies initialized successfully');

    // Middleware
    app.use(express.json());
    app.use(requestId);
    app.use(cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Routes
    app.use(`/auth`, authRouter);
    app.use(`/user`, userRouter);
    app.use(`/admin`, adminRouter);
    // app.use(`${API_PREFIX}/interview`, interviewRouter);
    // app.use(`${API_PREFIX}/analytical-dashboard`, dashboardRouter);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // Error handling (order matters)
    app.use(appExceptionHandler);
    app.use(validationExceptionHandler);
    app.use(genericExceptionHandler);

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server listening on http://localhost:${PORT}`);
    });

    // Shutdown hooks
    process.on('SIGINT', async () => {
      disconnectDB();
      logger.info('Application shutdown complete');
      if (global.logger && global.logger.flush) {
        try {
          await global.logger.flush(); // flush pino logs
        } catch (err) {
          logger.error("Error flushing logs:", err);
        }
      }
      process.exit(0);
    });

  } catch (err) {
    logger.error(`Failed to start application: ${err.message}`, { err });
    process.exit(1);
  }
})();
