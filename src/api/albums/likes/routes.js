const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    options: {
      auth: 'openmusic_jwt',
    },
    handler: handler.postAlbumLikeHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    options: {
      auth: 'openmusic_jwt',
    },
    handler: handler.deleteAlbumLikeHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesHandler,
  },
];

module.exports = routes;
