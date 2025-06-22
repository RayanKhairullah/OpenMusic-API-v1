// src/api/collaborations/index.js
const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistsService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService, // Penting: collaborations handler juga butuh playlistsService
      validator
    );
    server.route(routes(collaborationsHandler));
  },
};