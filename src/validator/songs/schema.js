// src/validator/songs/schema.js
const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(), // Opsional
  albumId: Joi.string(),   // Opsional
});

module.exports = { SongPayloadSchema };