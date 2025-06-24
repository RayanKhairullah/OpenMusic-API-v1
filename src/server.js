require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');

// Import services
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');
const ProducerService = require('./services/rabbitmq/producer');
const AlbumsLikesService = require('./services/postgres/AlbumsLikesService');
const CacheService = require('./services/redis/CacheService');

// Import validators
const UserValidator = require('./validator/users');
const AuthenticationValidator = require('./validator/authentications');
const AlbumValidator = require('./validator/albums');
const SongValidator = require('./validator/songs');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./validator/exports');

// Import API plugins
const users = require('./api/users');
const authentications = require('./api/authentications');
const albums = require('./api/albums');
const songs = require('./api/songs');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');
const exportsPlugin = require('./api/exports');
const albumLikes = require('./api/albums/likes');

// Import custom errors
const ClientError = require('./exceptions/ClientError');
// eslint-disable-next-line no-unused-vars
const AuthenticationError = require('./exceptions/AuthenticationError');
// eslint-disable-next-line no-unused-vars
const AuthorizationError = require('./exceptions/AuthorizationError');

const init = async () => {
  const cacheService = new CacheService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService, playlistActivitiesService);
  const albumsLikesService = new AlbumsLikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response.isBoom) {
        const { statusCode } = response.output;

        if (statusCode === 413) {
          return h.response({
            status: 'fail',
            message: 'Ukuran file terlalu besar, maksimal 512KB',
          }).code(413);
        }

        if (statusCode === 404) {
          return h.response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          }).code(404);
        }

        if (statusCode === 401) {
          return h.response({
            status: 'fail',
            message: 'Autentikasi gagal',
          }).code(401);
        }

        if (statusCode === 403) {
          return h.response({
            status: 'fail',
            message: 'Anda tidak berhak mengakses resource ini',
          }).code(403);
        }
      }

      if (response instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: response.message,
        }).code(response.statusCode);
      }

      console.error('[UNHANDLED ERROR]', response);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }

    return h.continue;
  });

  await server.register([
    Jwt,
    Inert,
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
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
      plugin: authentications,
      options: {
        authenticationsService,
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
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: albumLikes,
      options: {
        albumsLikesService,
        albumsService,
        cacheService,
      },
    },
  ]);

  server.route({
    method: 'GET',
    path: '/upload/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../public/images'),
        listing: false,
      },
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
