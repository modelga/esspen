const aggregate = require('./aggregate');
const repository = require('./repository');
const shared = require('./shared');
const middleware = require('./middleware');

module.exports = {
  ...aggregate,
  ...repository,
  ...shared,
  ...middleware,
};
