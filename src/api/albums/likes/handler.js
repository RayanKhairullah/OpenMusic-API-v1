const autoBind = require('auto-bind');
const ClientError = require('../../../exceptions/ClientError');

function handleError(error, h) {
  if (error instanceof ClientError) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(error.statusCode);
  }

  console.error(error);
  return h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  }).code(500);
}

class AlbumLikesHandler {
  constructor(albumLikesService, albumsService, cacheService) {
    this._albumLikesService = albumLikesService;
    this._albumsService = albumsService;
    this._cacheService = cacheService;

    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { userId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);
      const liked = await this._albumLikesService.isUserAlreadyLiked(userId, albumId); // <-- benar

      if (liked) {
        throw new ClientError('Anda sudah menyukai album ini', 400);
      }

      await this._albumLikesService.likeAlbum(userId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Album berhasil disukai',
      });
      response.code(201);
      return response;
    } catch (error) {
      return handleError(error, h);
    }
  }

  async deleteAlbumLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { userId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);
      await this._albumLikesService.unlikeAlbum(userId, albumId);
      await this._cacheService.delete(`album_likes:${albumId}`);

      return h.response({
        status: 'success',
        message: 'Like pada album berhasil dihapus',
      });
    } catch (error) {
      return handleError(error, h);
    }
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    try {
      const { likes, source } = await this._albumLikesService.getAlbumLikes(albumId);

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });

      if (source === 'cache') {
        response.header('X-Data-Source', 'cache');
      }

      return response;
    } catch (error) {
      return handleError(error, h);
    }
  }
}

module.exports = AlbumLikesHandler;
