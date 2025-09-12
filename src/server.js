// src/server.js

// 1. Impor dan Konfigurasi Environment
require('dotenv').config();
const Hapi = require('@hapi/hapi');

// 2. Impor semua komponen dari fitur Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// 3. Impor semua komponen dari fitur Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// 4. Impor komponen dari fitur Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// 5. Impor komponen dari fitur Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// 6. Impor Custom Error
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  // 7. Buat instance untuk setiap service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  // 8. Buat instance server Hapi
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // 9. Menerapkan Penanganan Error Global (onPreResponse)
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

      // Jika bukan ClientError, biarkan Hapi yang menanganinya
      if (!response.isServer) {
        return h.continue;
      }

      // Jika itu adalah server error (error 500)
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

  // 10. Registrasi semua plugin
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
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  // 11. Jalankan server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
