// src/api/authentications/handler.js
const autoBind = require('auto-bind');
const Jwt = require('@hapi/jwt'); // Pastikan ini sudah diinstal: npm install @hapi/jwt

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);

    const accessToken = Jwt.token.generate(
      { userId: id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_AGE }, // Kriteria 1: Access Token Age
    );
    const refreshToken = Jwt.token.generate(
      { userId: id },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_AGE }, // Kriteria 1: Refresh Token Age
    );

    await this._authenticationsService.addRefreshToken(refreshToken); // Kriteria 1: Refresh token terdaftar di database

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken); // Kriteria 1: Refresh token signature benar dan terdaftar
    const { userId } = Jwt.token.decode(refreshToken).decoded.payload; // Mengambil userId dari refresh token

    const accessToken = Jwt.token.generate(
      { userId },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_AGE },
    );

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken); // Kriteria 1: Refresh token signature benar dan terdaftar
    await this._authenticationsService.deleteRefreshToken(refreshToken); // Kriteria 1: Hapus autentikasi dari database

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
