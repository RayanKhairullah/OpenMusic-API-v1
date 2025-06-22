require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt'); // Pastikan ini terimport

// Import services
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService'); // Import ini
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

// Import validators
const UserValidator = require('./validator/users');
const AuthenticationValidator = require('./validator/authentications'); // Import ini
const AlbumValidator = require('./validator/albums');
const SongValidator = require('./validator/songs');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');

// Import API plugins
const users = require('./api/users');
const authentications = require('./api/authentications'); // Import ini
const albums = require('./api/albums');
const songs = require('./api/songs');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');

// Import custom errors
const ClientError = require('./exceptions/ClientError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const AuthorizationError = require('./exceptions/AuthorizationError'); // Import ini

const init = async () => {
  // Inisialisasi services
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService(); // Inisialisasi ini
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService, playlistActivitiesService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Kriteria 5: Penanganan Eror (Error Handling) - Meminimalisir boilerplate code dengan onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response.isBoom) {
        if (response.output.statusCode === 404) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }
        // Pastikan 401 dan 403 dari JWT atau Hapi juga tertangani
        if (response.output.statusCode === 401) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Autentikasi gagal', // Pesan umum untuk 401 dari Boom/JWT
          });
          newResponse.code(401);
          return newResponse;
        }
        if (response.output.statusCode === 403) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Anda tidak berhak mengakses resource ini', // Pesan umum untuk 403 dari Boom
          });
          newResponse.code(403);
          return newResponse;
        }
      }

      // Penanganan server error (error lain yang tidak tertangkap di atas)
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response); // Logging error asli untuk debugging
      return newResponse;
    }

    return h.continue;
  });

  // Mendaftarkan plugin JWT
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Mendefinisikan strategi autentikasi "openmusic_jwt"
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY, // Kriteria 1: ACCESS_TOKEN_KEY dari env
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE, // Kriteria 1: Access Token Age
    },
    validate: (artifacts) =>
      // Kriteria 1: JWT token harus mengandung payload berisi userId
      ({
        isValid: true,
        credentials: {
          userId: artifacts.decoded.payload.userId, // Menyimpan userId di credentials
        },
      })
    ,
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications, // Daftarkan plugin authentications
      options: {
        authenticationsService, // Pass service dan validator
        usersService,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService, // <--- Gunakan instance yang sudah diinisialisasi
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService, // <--- Gunakan instance yang sudah diinisialisasi
        playlistsService, // <--- Gunakan instance yang sudah diinisialisasi
        validator: CollaborationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
