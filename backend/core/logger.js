const pino = require("pino");
const { AsyncLocalStorage } = require("async_hooks");
const {
  LOG_LEVEL,
  LOG_FORMAT,
  ENABLE_CONSOLE_LOGGING,
  ENABLE_FILE_LOGGING,
  LOG_FILE_PATH,
  ELASTIC_APM_ENABLED,
  ELASTIC_APM_SERVER_URL,
  ELASTIC_APM_SERVICE_NAME,
  ELASTIC_APM_ENVIRONMENT,
  ENV,
} = require("./settings");

// Start Elastic APM if enabled
let apm = null;
if (ELASTIC_APM_ENABLED) {
  apm = require("elastic-apm-node").start({
    serviceName: ELASTIC_APM_SERVICE_NAME,
    serverUrl: ELASTIC_APM_SERVER_URL,
    environment: ELASTIC_APM_ENVIRONMENT,
  });
}

const asyncLocalStorage = new AsyncLocalStorage();
let loggerInstance = null;

function setupLogging() {
  const useThread = ENV === "production";
  let transport = null;
  try{
    if (LOG_FORMAT === "json") {
      if (ENABLE_FILE_LOGGING) {
        transport = pino.transport({
          targets: [
            {
              target: "pino/file",
              options: { destination: LOG_FILE_PATH },
              level: LOG_LEVEL || "info",
            },
          ],
          workerThread: useThread,
        });
      } else if (ENABLE_CONSOLE_LOGGING) {
        transport = pino.transport({
          target: "pino-pretty",
          options: { colorize: true },
          workerThread: useThread,
        });
      }
    } else {
      if (ENABLE_CONSOLE_LOGGING) {
        transport = pino.transport({
          target: "pino-pretty",
          options: { colorize: true },
          workerThread: useThread,
        });
      }
    }
  }catch(err){
    console.error("Failed to create pino transport, falling back to console", err);
    transport = undefined;
  }
  if (transport) {
  loggerInstance = pino(
    {
      level: LOG_LEVEL || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      mixin() {
        const store = asyncLocalStorage.getStore();
        return store ? { request_id: store.request_id } : {};
      },
    },
    transport
  );
} else {
  loggerInstance = pino({
    level: LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin() {
      const store = asyncLocalStorage.getStore();
      return store ? { request_id: store.request_id } : {};
    },
  });
}

  global.logger = loggerInstance;

  if (apm) {
    loggerInstance.info("Elastic APM integrated for logging");
  }
}

function getLogger(name) {
  if (!loggerInstance) {
    return {
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
    };
  }
  return loggerInstance.child({ name });
}

function withRequestId(requestId, fn) {
  asyncLocalStorage.run({ request_id: requestId }, fn);
}

function getRequestId() {
  const store = asyncLocalStorage.getStore();
  return store ? store.request_id : "unknown";
}

module.exports = {
  setupLogging,
  getLogger,
  withRequestId,
  getRequestId,
};
