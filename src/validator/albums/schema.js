// src/validator/albums/schema.js
const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // Batasi tahun dari 1900 hingga tahun sekarang
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
});

module.exports = { AlbumPayloadSchema };