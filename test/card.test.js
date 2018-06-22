const { test } = require('ava');

const time = new Date('2018-10-10T23:30:30.000Z');
const clock = () => time;
const { aggregate, recreateFrom } = require('../example/card/card')({ clock });

const card = aggregate;
test('cannot assign limit for the second time', (t) => {
  const c = card();
  c.assignLimit(100000);
  t.throws(() => { c.assignLimit(150000); }, /Cannot assign limit for the second time/);
});

test('can assign limit to a card', (t) => {
  const c = card();
  c.assignLimit(100000);
  t.is(c.availableLimit(), 100000);
});
test('cannot withdraw when not enough money', (t) => {
  const c = card();
  c.assignLimit(100000);
  t.throws(() => { c.withdraw(150000); }, /Not enough money/);
});
test('cannot withdraw when no limit assigned', (t) => {
  const c = card();
  t.throws(() => {
    c.withdraw(150000);
  }, /No limit assigned/);
});
test('can withdraw from a card', (t) => {
  const c = card();
  c.assignLimit(100000);
  c.withdraw(50000);
  t.is(c.availableLimit(), 50000);
});
test('can repay a card', (t) => {
  const c = card();
  c.assignLimit(150000);
  c.withdraw(100000);

  c.repay(50000);

  t.is(c.availableLimit(), 100000);
});
test('can capture events', (t) => {
  const c = card('1234');
  c.assignLimit(150000);
  c.withdraw(100000);
  c.repay(50000);

  t.deepEqual(c.pendingEvents(), [
    {
      type: 'LIMIT_ASSIGNED', amount: 150000, time: '2018-10-10T23:30:30.000Z',
    },
    {
      type: 'CARD_WITHDRAWN', amount: 100000, time: '2018-10-10T23:30:30.000Z',
    },
    {
      type: 'CARD_REPAID', amount: 50000, time: '2018-10-10T23:30:30.000Z',
    },
  ]);
});

test('new card gets a new id', (t) => {
  const c = card('1234');

  t.is(c.aggregateId(), '1234');
});

test('can capture events', (t) => {
  const c = recreateFrom('12345', [{
    type: 'LIMIT_ASSIGNED', amount: 150000, time: '2018-10-10T23:30:30.000Z',
  },
  {
    type: 'CARD_WITHDRAWN', amount: 100000, time: '2018-10-10T23:30:30.000Z',
  },
  {
    type: 'CARD_REPAID', amount: 50000, time: '2018-10-10T23:30:30.000Z',
  }]);

  t.is(c.aggregateId(), '12345');
  t.is(c.availableLimit(), 100000);
  t.deepEqual(c.pendingEvents(), []);
});
