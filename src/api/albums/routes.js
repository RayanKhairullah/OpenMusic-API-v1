const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    options: {
      payload: {
        allow: ['multipart/form-data'],
        multipart: {
          output: 'stream',
        },
        output: 'stream',
        parse: true,
        maxBytes: 512000,
      },
    },
    handler: handler.postUploadCoverHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = routes;
