module.exports = class HealthController {
  constructor({ HealthService }) {
    this.HealthService = HealthService;
  }

  async getHealthCheck() {
    const { HealthService } = this;

    return HealthService.getHealthCheck();
  }
};
