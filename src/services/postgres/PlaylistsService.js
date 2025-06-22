const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

console.log('--- Debug PlaylistsService ---');
console.log('Type of AuthorizationError:', typeof AuthorizationError);
console.log('Value of AuthorizationError:', AuthorizationError);
console.log('--- End Debug ---');

class PlaylistsService {
  constructor(collaborationService, playlistActivitiesService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._playlistActivitiesService = playlistActivitiesService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
             FROM playlists
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             LEFT JOIN users ON users.id = playlists.owner
             WHERE playlists.owner = $1 OR collaborations.user_id = $1
             GROUP BY playlists.id, playlists.name, users.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlist_song-${nanoid(16)}`;

    // Memastikan songId ada
    const checkSongQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const checkSongResult = await this._pool.query(checkSongQuery);
    if (!checkSongResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    // Memastikan tidak ada duplikasi lagu di playlist
    const checkDuplicateQuery = {
      text: 'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const checkDuplicateResult = await this._pool.query(checkDuplicateQuery);
    if (checkDuplicateResult.rows.length) {
      throw new InvariantError('Lagu sudah ada di playlist ini');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'add',
    });
  }

  async getSongsInPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
             FROM playlist_songs
             JOIN songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1
    `,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Lagu tidak ditemukan di playlist ini');
    }

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
    });
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Jika playlist tidak ditemukan, langsung throw
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error; // Jika bukan owner dan bukan collaborator, throw error original (AuthorizationError dari verifyPlaylistOwner)
      }
    }
  }

  async getPlaylistActivities(playlistId) {
    return this._playlistActivitiesService.getActivities(playlistId);
  }
}

module.exports = PlaylistsService;
