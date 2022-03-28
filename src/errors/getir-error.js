module.exports = class GetirError extends Error {
  constructor(message, code, statusCode = 500, data, args = []) {
    super(message);

    if (this.constructor === GetirError) {
      throw new TypeError('Abstract class "GetirError" cannot be instantiated directly.');
    }

    this.code = code;
    this.data = data;
    this.args = args;
    this.statusCode = statusCode;
  }
};
