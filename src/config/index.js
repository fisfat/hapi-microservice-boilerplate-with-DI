const env = process.env.NODE_ENV || 'dev';
const name = process.env.NAME || 'fisfat-microservice-boilerplate';
const version = process.env.VERSION || 1.0;

module.exports = {
  env,
  redis: {
    url: process.env.REDIS_URL || '',
  },
  mongodb: {
    url: process.env.MONGODB_URL || '',
    reconnectTries: Number.MAX_VALUE,
    poolSize: 10,
  },
  server: {
    port: +(process.env.SERVER_PORT || process.env.PORT || 8080),
    keepAliveTimeout: +(process.env.SERVER_KEEP_ALIVE_TIMEOUT || 120000),
    returnValidationInfoError: (process.env.SERVER_RETURN_VALIDATION_INFO_ERROR || 'false').trim().toLowerCase() === 'true',
  },
  swagger: {
    enabled: (process.env.SWAGGER_ENABLED || 'false').trim().toLowerCase() === 'true',
  },
  log: {
    name,
    version,
    env,
    level: process.env.LOG_LEVEL || 'info',
  },
  safeShutdownDelay: process.env.SAFE_SHUTDOWN_DELAY || 15000,
};
