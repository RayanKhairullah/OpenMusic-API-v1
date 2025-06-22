// src/validator/collaborations/schema.js
const Joi = require('joi');

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = CollaborationPayloadSchema;