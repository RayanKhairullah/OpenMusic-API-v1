require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums/index');
const songs = require('./api/songs/index');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const AlbumValidator = require('./validator/albums/index');
const SongValidator = require('./validator/songs/index');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

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
    // Mendapatkan konteks response dari request
    const { response } = request;

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

      if (response.output.statusCode === 500) {
        // forInternal Server Error if ClientError
        const newResponse = h.response({
          status: 'error',
          message: 'Terjadi kegagalan pada server kami',
        });
        newResponse.code(500);
        return newResponse;
      }
    }

    return h.continue;
  });

  await server.register([
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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();