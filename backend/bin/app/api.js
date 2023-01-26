const User = require('./modules/user');
const Table = require('./modules/table')
const Menu = require('./modules/menu');
const Transaction = require('./modules/transaction')

const user = new User();
const table = new Table();
const menu = new Menu();
const transaction = new Transaction();

const jwtAuth = require('../../auth/auth');
const upload = require('./utils/uploadMulter')

const routes = async (server) => {

  server.post('/api/user/login', user.login);
  server.post('/api/user/', jwtAuth, user.create);
  server.put('/api/user/:id', jwtAuth, user.update);
  server.delete('/api/user/:id', jwtAuth, user.delete);
  server.get('/api/user/', jwtAuth, user.getAll);
  server.get('/api/user/:id', jwtAuth, user.getOne);

  server.post('/api/table/', jwtAuth, table.create);
  server.put('/api/table/:id', jwtAuth, table.update);
  server.put('/api/table/updateStatus/:id', jwtAuth, table.updateStatus);
  server.delete('/api/table/:id', jwtAuth, table.delete);
  server.get('/api/table/', jwtAuth, table.getAll);
  server.get('/api/table/:id', jwtAuth, table.getOne);

  server.post('/api/menu/', upload.single("image"), jwtAuth, menu.create);
  server.put('/api/menu/:id', upload.single("image"), jwtAuth, menu.update);
  server.delete('/api/menu/:id', jwtAuth, menu.delete);
  server.get('/api/menu/', jwtAuth, menu.getAll);
  server.get('/api/menu/:id', jwtAuth, menu.getOne);
  server.get('/api/menu/:type', jwtAuth, menu.getByType);

  server.get('/api/transaction/', jwtAuth, transaction.findAll);
  server.post('/api/transaction', jwtAuth, transaction.store);
  server.put('/api/transaction/updateStatus/:id_transaction', jwtAuth, transaction.updateStatus);
};

module.exports = { routes };
