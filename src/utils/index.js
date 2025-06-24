const mapAlbumDBToModel = ({
  id, name, year, cover,
}) => ({
  id,
  name,
  year,
  cover,
});

const mapSongDBToModel = ({
  // eslint-disable-next-line camelcase
  id, title, year, performer, genre, duration, album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  // eslint-disable-next-line camelcase
  albumId: album_id,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel };
