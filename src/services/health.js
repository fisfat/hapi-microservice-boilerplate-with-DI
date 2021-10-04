module.exports = class HealthService {
  // eslint-disable-next-line class-methods-use-this
  async getHealthCheck() {
    return { time: Date.now(), status: 'OK' };
  }
};
