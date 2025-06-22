const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401); // Status Code 401: Unauthorized
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
