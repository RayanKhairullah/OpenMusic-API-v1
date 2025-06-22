/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Tambahkan unique constraint agar tidak ada lagu duplikat di playlist yang sama
  pgm.addConstraint('playlist_songs', 'unique_playlist_id_and_song_id', {
    unique: ['playlist_id', 'song_id'],
  });

  // Tambahkan foreign key constraint ke tabel playlists
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE', // Jika playlist dihapus, entri lagunya juga dihapus
    },
  });

  // Tambahkan foreign key constraint ke tabel songs
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE', // Jika song dihapus, entri di playlist juga dihapus
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};