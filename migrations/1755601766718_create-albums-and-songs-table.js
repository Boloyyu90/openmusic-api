/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Membuat tabel albums
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });

  // Membuat tabel songs
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      // Boleh null sesuai kriteria
    },
    album_id: { // Kita gunakan snake_case untuk kolom di database
      type: 'VARCHAR(50)',
      references: '"albums"(id)', // Mereferensikan ke tabel albums
      onDelete: 'CASCADE', // Jika album dihapus, lagu-lagu di dalamnya ikut terhapus
    },
  });
};

exports.down = (pgm) => {
  // Urutan drop dibalik dari urutan create
  pgm.dropTable('songs');
  pgm.dropTable('albums');
};