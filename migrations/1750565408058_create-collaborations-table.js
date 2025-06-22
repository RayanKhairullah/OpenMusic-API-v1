/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Tambahkan unique constraint agar tidak ada kolaborasi duplikat
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', {
    unique: ['playlist_id', 'user_id'],
  });

  // Tambahkan foreign key constraint ke tabel playlists
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE', // Jika playlist dihapus, kolaborasinya juga dihapus
    },
  });

  // Tambahkan foreign key constraint ke tabel users
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE', // Jika user dihapus, kolaborasinya juga dihapus
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
