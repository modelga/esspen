module.exports = {
  eventStore: {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    dbName: 'myStorage',
    eventsCollectionName: 'events',
    snapshotsCollectionName: 'snapshots',
    transactionsCollectionName: 'transactions',
    timeout: 10000,
  },
};
