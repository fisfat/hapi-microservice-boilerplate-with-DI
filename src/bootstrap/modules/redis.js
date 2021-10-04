const promisifyAll = require('util-promisifyall');
const redis = promisifyAll(require('redis'));

class RedisComponent {
  constructor(redisConfig, logger) {
    this.client = null;
    this.config = redisConfig;
    this.logger = logger;
  }

  async start() {
    const {
      config: {
        url,
        reconnectTries,
        reconnectAfter,
        reconnectTimeout,
      },
      logger,
    } = this;
    const retryStrategy = ({ attempt, totalRetryTime, error }) => {
      logger.warn(`Trying to reconnect to Redis. Attempt no: ${attempt}. Error details: ${JSON.stringify(error)}`);
      if (attempt > reconnectTries) {
        throw new Error('Reconnecting attempt limit exhausted');
      }
      if (totalRetryTime > reconnectTimeout) {
        throw new Error('Retry time exhausted');
      }
      // it tries to reconnect after x milliseconds where the x is the return value of this function
      return reconnectAfter;
    };
    this.client = promisifyAll(await redis.createClient({ url, retryStrategy }));
  }

  async stop() {
    return this.client.quit();
  }

  register() {
    return this.client;
  }
}

// module.exports = makeBootstrapComponent(({ config: { redis: redisConfig }, logger }) => new RedisComponent(redisConfig, logger));
module.exports = new RedisComponent();
