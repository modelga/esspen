const bodyParser = require('body-parser');

const { initStore } = require('../../lib');
const cardModule = require('./card/cardRoute');

module.exports = async function main(config = { eventStore: {} }) {
  const express = require('express');
  const app = express();
  app.use(bodyParser.json());
  const eventStore = await initStore({
    config: config.eventStore,
  });

  app.close = function close() {
    eventStore.close();
  };
  app.use(cardModule({ eventStore }));

  return app;
};
