const mapObj = require('map-obj');
const cardLinks = require('./cardLinks');

module.exports = function cardControllerFactory({ repository, handle }) {
  const handledCommands = mapObj({
    repayment: (card, body) => {
      card.repay(body.amount);
    },
    withdrawal: (card, body) => {
      card.withdraw(body.amount);
    },
    limit: (card, body) => {
      card.assignLimit(body.amount);
    },
  }, (key, commandHandler) => [key, handle(commandHandler)]);

  return {
    ...handledCommands,
    async events(req, res) {
      console.log(req.path);
      try {
        const skip = Number(req.query.skip || 0);
        const limit = Number(req.query.limit || 10);
        const data = await repository.loadEvents({
          skip,
          limit,
          aggregateId: req.params.aggregateId,
        });
        res.header('Link', cardLinks.events.paginationLink(req)({ skip, limit, results: data.length }));
        res.json(data);
      } catch (e) {
        res.json({ message: e.message });
      }
    },
    async debug(req, res) {
      const c = await repository.load(req.params.aggregateId);
      res.json(c.data());
    },
  };
};

