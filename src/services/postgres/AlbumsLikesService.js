const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async _verifyAlbumExists(albumId) {
    const result = await this._pool.query({
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async likeAlbum(userId, albumId) {
    await this._verifyAlbumExists(albumId);

    const alreadyLiked = await this.isUserAlreadyLiked(userId, albumId);
    if (alreadyLiked) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `albumlike-${nanoid(16)}`;

    await this._pool.query({
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    });

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    await this._verifyAlbumExists(albumId);

    const result = await this._pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Anda belum menyukai album ini');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async isUserAlreadyLiked(userId, albumId) {
    const result = await this._pool.query({
      text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    return result.rowCount > 0;
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album_likes:${albumId}`, JSON.stringify(likes), 1800);
      return {
        likes,
        source: 'db',
      };
    }
  }
}

module.exports = AlbumsLikesService;
