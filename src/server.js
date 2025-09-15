// src/server.js

// 1. Impor dan Konfigurasi Environment
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

// 6. Impor komponen dari fitur Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// 7. Impor Custom Error
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  // 8. Buat instance untuk setiap service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();

  // 9. Buat instance server Hapi
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // 10. Menerapkan Penanganan Error Global (onPreResponse)
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

  // 11. Registrasi plugin eksternal
  await server.register(Jwt);

  // 12. Mendefinisikan strategy autentikasi JWT
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { userId: artifacts.decoded.payload.userId },
    }),
  });

  // 13. Registrasi semua plugin
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
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
  ]);

  // 14. Jalankan server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
