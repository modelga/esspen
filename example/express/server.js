const config = require('./config');

(async function main(app) {
  (await app(config)).listen(3000, () => {
    console.log('Listening on port ', 3000);
  });
}(require('./app')));
