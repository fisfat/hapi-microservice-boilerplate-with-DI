const { v4: uuidv4 } = require('uuid');
const Os = require('os');

const getRequestIdFromRequest = (request) => (
  request.headers.requestid || request.info.id
);

const generateCustomRequestId = () => `${Os.hostname()}:${uuidv4()}:${process.pid}`;

const stringFormat = (str, data) => (
  str.replace(/{([a-z0-9_$]+)}/gi, (match) => data[match.slice(1, -1)])
);

module.exports = {
  getRequestIdFromRequest,
  generateCustomRequestId,
  stringFormat,
};
