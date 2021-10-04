const axios = require('axios');

const { MICROSERVICE } = require('../constants/error-messages');
const { deepObjectIdToString } = require('./string');

module.exports = class ServiceCaller {
  constructor({ config: { microservice: config }, logger }) {
    this.config = config;
    this.logger = logger;
  }

  static generateErrorFunction(microservice, request) {
    return function generateServiceCallerError(message = MICROSERVICE.message, code = MICROSERVICE.code, data) {
      const error = new Error(message);
      error.microservice = microservice;
      error.serviceCallerRequest = request;
      error.code = code;
      error.data = data;
      error.isOriginatedFromAnotherService = code !== MICROSERVICE.code;

      return error;
    };
  }

  assignRequestId(requestId) {
    this.requestId = requestId;
  }

  async request(microservice, method, path, data = {}, params = {}, headers = {}, timeout = this.config.timeout) {
    const { config, logger, requestId } = this;
    const url = `${config.urls[microservice]}${path}`;

    const start = new Date();
    const request = {
      method,
      url,
      data,
      params: deepObjectIdToString(params),
      headers: requestId ? { ...headers, requestId } : headers,
      timeout,
      validateStatus: () => true,
    };

    const generateError = ServiceCaller.generateErrorFunction(microservice, request);

    return axios(request)
      .catch((error) => {
        throw generateError(error.message);
      })
      .then((response) => {
        const elapsed = (+new Date()) - (+start);

        logger.debug('service caller response', {
          microservice,
          method,
          url,
          data,
          params,
          headers,
          requestId,
          start,
          elapsed,
          status: response.status,
          response: response.data,
        });

        if (response.status === 200) {
          return response.data;
        }

        if (response.data.code) {
          throw generateError(response.data.message, response.data.code, response.data.data);
        }

        throw generateError();
      });
  }
};
