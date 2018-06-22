const bodyParser = require('body-parser');

const { initStore } = require('../../lib');
const cardModule = require('./card/cardRoute');

module.exports = async function main({ config } = {}) {
  const express = require('express');
  const app = express();
  app.use(bodyParser.json());
  const eventStore = await initStore({
    config: {
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      dbName: 'myStorage',
      eventsCollectionName: 'events',
      snapshotsCollectionName: 'snapshots',
      transactionsCollectionName: 'transactions',
      timeout: 10000,
    },
  });

  app.close = function close() {
    eventStore.close();
  };
  app.use(cardModule({ eventStore }));

  return app;
};
