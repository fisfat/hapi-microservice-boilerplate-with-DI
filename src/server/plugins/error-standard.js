const ERROR_MESSAGES = require('../../constants/error-messages');
const GetirError = require('../../errors/getir-error');

const { getRequestIdFromRequest, stringFormat } = require('../utils');

const createGetirErrorResponse = (getirError) => {
  const error = getirError.constructor.name;
  const {
    code, message, data, args,
  } = getirError;

  return {
    code,
    error,
    message: stringFormat(message, args),
    data,
  };
};

const createMicroserviceErrorForResponse = (microserviceError) => {
  const { error } = ERROR_MESSAGES.MICROSERVICE;
  const { microservice, code, message } = microserviceError;

  return {
    microservice,
    code,
    error,
    message,
  };
};

const createJoiErrorForResponse = (joiError) => {
  const { code, error } = ERROR_MESSAGES.VALIDATION;
  const { message, details, output: { payload: { validation: { source } = {} } = {} } = {} } = joiError;

  return {
    code,
    error,
    message,
    details,
    source,
  };
};

const createUnknownErrorResponse = () => {
  const { code, error, message } = ERROR_MESSAGES.UNKNOWN;

  return {
    code,
    error,
    message,
  };
};

const getOutputForError = (error) => {
  if (error instanceof GetirError) {
    return createGetirErrorResponse(error);
  }

  if (error && error.isMicroservice) {
    return createMicroserviceErrorForResponse(error);
  }

  if (error && error.isJoi) {
    return createJoiErrorForResponse(error);
  }

  return createUnknownErrorResponse();
};

const sendToSentry = (response, callback) => {
  if (!(response instanceof GetirError)) {
    callback(response);
  }
};

module.exports = ({ logger, Sentry }) => ([
  {
    name: 'error-standard',
    version: '0.0.1',
    register(server) {
      server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
          sendToSentry(response, Sentry.captureException);

          response.output.payload = getOutputForError(response);
          response.output.statusCode = response.statusCode || 500;

          const { method, path } = request;
          const requestId = getRequestIdFromRequest(request);

          logger.error({
            ...response,
            message: response.message || ERROR_MESSAGES.UNKNOWN.message,
            method,
            path,
            requestId,
          });
        }

        return h.continue;
      });
    },
  },
]);
