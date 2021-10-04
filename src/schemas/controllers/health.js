const Joi = require('joi');

module.exports = {
  getHealthCheck: {
    validate: {},
    response: {
      schema: (
        Joi
          .object()
          .keys({
            time: Joi.date().timestamp(),
            status: Joi.string(),
          })
          .label('Health Check Response Schema')
      ),
    },
  },
};
