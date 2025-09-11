const { execSync, spawn } = require('child_process');
const { setupLogging, getLogger } = require('./core/logger');

const logger = getLogger("dockerRedisManager");

function isRedisRunning() {
    try{
        const output = execSync(`docker ps --filter "name=my_redis" --filter "status=running" --format "{{.Names}}"`);
        return output.toString().trim() === "my_redis";
    }catch(err){
        logger.error("Error checking Redis status:", err);
        return false;
    }
}

function startRedis() {
  if (!isRedisRunning()) {
    logger.info("Starting Redis container...");
    execSync(`docker run -d --name my_redis -p 6379:6379 redis`, { stdio: "inherit" });
  } else {
    logger.info("Redis is already running.");
  }
}

function stopRedis() {
  if (isRedisRunning()) {
    logger.info("Stopping Redis container...");
    execSync(`docker stop my_redis && docker rm my_redis`, { stdio: "inherit" });
  }
}

module.exports = {
  startRedis,
  stopRedis,
  isRedisRunning
};