const nodemailer = require('nodemailer');
const config = require('../../utils/config');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    });
  }

  async sendEmail(targetEmail, content) {
    const message = {
      from: 'OpenMusic <no-reply@openmusic.com>',
      to: targetEmail,
      subject: 'Ekspor Lagu dari Playlist',
      text: 'Berikut hasil ekspor playlist-mu',
      attachments: [
        {
          filename: 'playlist.json',
          content,
        },
      ],
    };

    await this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
