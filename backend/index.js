// index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PORT, ALLOWED_ORIGINS } from './core/settings.js';
import { disconnectDB } from './core/database.js';
import { initializeDependencies } from './core/deps.js';
import { appExceptionHandler, validationExceptionHandler, genericExceptionHandler } from './middleware/errorHandler.js';
import requestId from './middleware/requestId.js';
import { setupLogging, getLogger } from './core/logger.js';

// Routes
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import publicRouter from './routes/publicRoutes.js';
// import dashboardRouter from './routes/dashboardRoutes.js';

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
    app.use(cookieParser())

    // Routes
    app.use(`/auth`, authRouter);
    app.use(`/user`, userRouter);
    app.use(`/admin`, adminRouter);
    app.use(`/public`,publicRouter);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // Error handling (order matters)
    app.use(appExceptionHandler);
    app.use(validationExceptionHandler);
    app.use(genericExceptionHandler);

    // Start server
    app.listen(PORT, "0.0.0.0",() => {
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
