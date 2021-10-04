const {
  getHealthCheck,
} = require('../../schemas/controllers/health');

module.exports = ([
  {
    path: '/health',
    method: 'GET',
    config: {
      tags: ['api'],
      description: 'Health check for the service.',
      validate: getHealthCheck.validate,
      response: getHealthCheck.response,
      plugins: {
        logging: false,
      },
    },
    handler: ({ HealthController }) => ((request) => HealthController.getHealthCheck(request)),
  },
]);
