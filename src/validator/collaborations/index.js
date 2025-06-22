// src/validator/collaborations/index.js
const InvariantError = require('../../exceptions/InvariantError');
const CollaborationPayloadSchema = require('./schema'); // Akan kita buat file schema.js

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationsValidator;
