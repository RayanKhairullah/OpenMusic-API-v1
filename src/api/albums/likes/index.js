const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumsLikes',
  version: '1.0.0',
  register: async (server, { albumsLikesService, albumsService, cacheService }) => {
    const handler = new AlbumLikesHandler(albumsLikesService, albumsService, cacheService);
    server.route(routes(handler));
  },
};
