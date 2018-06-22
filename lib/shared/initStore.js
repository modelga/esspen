const EventStore = require('eventstore');

function initStore({
  config = {
    eventsCollectionName: 'events',
    snapshotsCollectionName: 'snapshots',
    transactionsCollectionName: 'transactions',
    timeout: 10000,
  },
  eventPublisher = () => {},
} = {}) {
  if (typeof eventPublisher !== 'function') {
    throw new Error('eventPublisher has to be function');
  }
  const es = EventStore(config);
  es.useEventPublisher((evt, callback) => {
    if (eventPublisher.length === 1) {
      eventPublisher(evt);
      callback();
    } else {
      eventPublisher(evt, callback);
    }
  });
  es.defineEventMappings({ id: 'event_id' });
  es.close = () => {
    if (es.store.db) {
      es.store.db.close();
    }
  };
  return new Promise(((resolve, reject) => {
    es.init((err) => {
      if (err) reject(err);
      resolve(es);
    });
  }));
}

module.exports = initStore;
