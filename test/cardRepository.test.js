const test = require('ava');
const randomatic = require('randomatic');
const cardFactory = require('../example/card/card');
const { repositoryFactory } = require('../lib');
const { initStore } = require('../lib');

function clock() { return new Date('August 19, 2018 23:15:30 UTC'); }
const cardAggregate = cardFactory({ clock });

test('should be able to save and load credit card', async (t) => {
  const eventStore = await initStore();
  const repository = repositoryFactory({ eventStore })(cardAggregate);
  const id = randomatic('Aa0', 6);
  const header = cardAggregate.header(id);
  let c = cardAggregate.aggregate(id);
  c.assignLimit(100);
  c.withdraw(20);
  c.repay(20);

  t.is(c.pendingEvents().length, 3);
  await repository.save(c);
  t.is(c.pendingEvents().length, 0);

  c = await repository.load(header);
  t.is(c.availableLimit(), 100);

  c.withdraw(100);

  t.is(c.pendingEvents().length, 1);
  await repository.save(c);
  t.is(c.pendingEvents().length, 0);

  c = await repository.load(header);
  t.is(c.availableLimit(), 0);
  eventStore.close();
});

test('should be able to use snapshots', async (t) => {
  const eventStore = await initStore({});
  const repository = repositoryFactory({ eventStore })(cardAggregate);
  const id = randomatic('Aa0', 6);
  const header = cardAggregate.header(id);
  let c = cardAggregate.aggregate(id);
  c.assignLimit(100);
  c.withdraw(100);
  await repository.save(c);
  c = await repository.load(header);
  t.is(c.availableLimit(), 0);
  c.repay(10);
  c.repay(10);
  await repository.save(c, { forceSnapshot: true });
  c = await repository.load(header);
  t.is(c.availableLimit(), 20);
  c.repay(10);
  c.repay(10);
  t.is(c.pendingEvents().length, 2);

  await repository.save(c);

  t.is(c.pendingEvents().length, 0);

  c = await repository.load(header);
  t.is(c.pendingEvents().length, 0);
  t.is(c.availableLimit(), 40);
  eventStore.close();
});
