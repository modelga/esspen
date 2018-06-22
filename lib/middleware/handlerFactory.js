const { ClientError } = require('../shared');

module.exports = function handlerFactory({ repository, log = () => {} } = {}) {
  function withErrorHandling(fn) {
    return async function cb(req, res) {
      try {
        await fn(req.body);
        return res.status(204).send();
      } catch (e) {
        if (e instanceof ClientError) {
          return res.status(400).json({ error: e.message });
        }
        log(e);
        return res.status(500).send();
      }
    };
  }

  function withPersistence(fn) {
    return async (body) => {
      const c = await repository.load(body.uuid);
      fn(c, body);
      await repository.save(c);
    };
  }
  return function handle(command) {
    return withErrorHandling(withPersistence(command));
  };
};

