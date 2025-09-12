// src/utils/index.js

const mapDBToModel = ({ album_id, ...args }) => ({
  ...args,
  albumId: album_id,
});

module.exports = { mapDBToModel };