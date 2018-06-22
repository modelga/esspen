const { Router } = require('express');
const cardControllerFactory = require('./cardController');
const { handlerFactory, repositoryFactory } = require('../../../lib');
const aggregateFactory = require('../../card/card');
const cardLinks = require('./cardLinks');

module.exports = ({ eventStore }) => {
  const router = Router();
  const aggregate = aggregateFactory();
  const cardRepository = repositoryFactory({ eventStore })(aggregate);

  const handle = handlerFactory({ repository: cardRepository });
  const controller = cardControllerFactory({ repository: cardRepository, handle });


  const commandLinks = cardLinks.commands;

  router.post(commandLinks.LIMIT, controller.limit);
  router.post(commandLinks.WITHDRAWAL, controller.withdrawal);
  router.post(commandLinks.REPAYMENT, controller.repayment);

  router.get(cardLinks.events.FIRST_PAGE, controller.events);

  router.get(cardLinks.debug.SINGLE_CARD, controller.debug);

  return router;
};
