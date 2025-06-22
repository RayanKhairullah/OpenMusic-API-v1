// src/api/users/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
];

module.exports = routes;