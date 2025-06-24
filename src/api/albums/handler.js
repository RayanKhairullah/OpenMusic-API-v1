const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return h.response({
      status: 'success',
      data: {
        album,
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
  }

  async postUploadCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    // eslint-disable-next-line global-require
    const path = require('path');
    // eslint-disable-next-line global-require
    const fs = require('fs');

    try {
      if (!cover || !cover.hapi) {
        throw new ClientError('Berkas cover tidak ditemukan', 400);
      }

      const contentType = cover.hapi.headers['content-type'];
      if (!contentType.startsWith('image/')) {
        throw new ClientError('Tipe file tidak didukung, harus berupa gambar', 400);
      }

      const filename = `${albumId}-${cover.hapi.filename}`;
      const folderPath = path.resolve(__dirname, '../../../public/images');

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fullPath = path.join(folderPath, filename);
      const fileStream = fs.createWriteStream(fullPath);

      await new Promise((resolve, reject) => {
        cover.pipe(fileStream);
        cover.on('end', resolve);
        cover.on('error', reject);
      });

      await this._service.updateAlbumCover(albumId, filename);
      console.log('Cover filename saved to DB:', filename);

      return h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      }).code(201);
    } catch (error) {
      if (error.isBoom && error.output.statusCode === 413) {
        return h.response({
          status: 'fail',
          message: 'Ukuran file terlalu besar, maksimal 512KB',
        }).code(413);
      }

      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error('[Upload Error]', error);

      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
  }
}

module.exports = AlbumsHandler;
