// src/server.js

// 1. Impor dan Konfigurasi Environment
require('dotenv').config();
const Hapi = require('@hapi/hapi');

// 2. Impor semua komponen dari fitur Albums
const albums = require('./api/albums'); // Plugin Albums
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// 3. Impor semua komponen dari fitur Songs
const songs = require('./api/songs'); // Plugin Songs
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// 4. Impor Custom Error
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  // 5. Buat instance untuk setiap service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  // 6. Buat instance server Hapi
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'], // Izinkan akses dari mana saja (untuk development)
      },
    },
  });

  // 7. Menerapkan Penanganan Error Global (onPreResponse)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Cek jika response adalah sebuah Error
    if (response instanceof Error) {
      // Jika itu adalah ClientError (error yang kita buat), format ulang responsenya
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Jika bukan ClientError, biarkan Hapi yang menanganinya (misal error dari Hapi sendiri)
      if (!response.isServer) {
        return h.continue;
      }

      // Jika itu adalah server error (error 500), tampilkan di console dan berikan response generik
      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // Jika bukan error, lanjutkan dengan response yang ada
    return h.continue;
  });


  // 8. Registrasi kedua plugin kita
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  // 9. Jalankan server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();