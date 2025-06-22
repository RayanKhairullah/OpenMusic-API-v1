// src/services/postgres/CollaborationsService.js
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    // Memastikan userId ada
    const checkUserQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const checkUserResult = await this._pool.query(checkUserQuery);
    if (!checkUserResult.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Memastikan playlistId ada
    const checkPlaylistQuery = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const checkPlaylistResult = await this._pool.query(checkPlaylistQuery);
    if (!checkPlaylistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
