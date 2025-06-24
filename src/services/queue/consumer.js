const amqp = require('amqplib');
const MailSender = require('../mailer/MailSender');
const PlaylistsService = require('../postgres/PlaylistsService');
const SongsService = require('../postgres/SongsService');
// eslint-disable-next-line no-unused-vars
const UsersService = require('../postgres/UsersService');
const config = require('../../utils/config');

const init = async () => {
  const connection = await amqp.connect(config.rabbitMq.server);
  const channel = await connection.createChannel();

  const queue = 'export:playlists';
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(msg.content.toString());

      const playlistsService = new PlaylistsService();
      // eslint-disable-next-line no-unused-vars
      const songsService = new SongsService();
      const mailSender = new MailSender();

      const playlist = await playlistsService.getPlaylistById(playlistId);
      const songs = await playlistsService.getSongsInPlaylist(playlistId);

      const data = {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          songs,
        },
      };

      const content = JSON.stringify(data, null, 2);
      await mailSender.sendEmail(targetEmail, content);

      console.log(`Email berhasil dikirim ke ${targetEmail}`);
    } catch (error) {
      console.error('Gagal memproses pesan:', error);
    }

    channel.ack(msg);
  });
};

init();
