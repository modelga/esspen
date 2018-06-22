const { snapshotEveryXRevisions } = require('./snapshotStrategies');

function genericRepository({ eventStore, snapshotStrategy = snapshotEveryXRevisions(100) } = {}) {
  return function repositoryWithEventStore({ recreateFrom, header = () => { throw new Error('Header function not defined'); } }) {
    if (typeof recreateFrom !== 'function') {
      throw new Error('You have to provide recreateFrom function');
    }
    if (typeof eventStore !== 'object') {
      throw new Error('You have to provide eventStore object');
    } else if (typeof eventStore.getFromSnapshot !== 'function') {
      throw new Error('You have to provide eventStore.getFromSnapshot function');
    } else if (typeof eventStore.createSnapshot !== 'function') {
      throw new Error('You have to provide eventStore.createSnapshot function');
    }

    function headerValidateSanitize(aggregateHeader) {
      if (typeof aggregateHeader === 'string') {
        return header(aggregateHeader);
      }
      if (typeof aggregateHeader !== 'object') {
        throw new Error('header has to be object');
      } else if (!aggregateHeader.aggregateId) {
        throw new Error('header.aggregateId has to be defined');
      }
      return aggregateHeader;
    }

    return {
      async save(aggregate, { forceSnapshot = false } = {}) {
        return new Promise((resolve, reject) => {
          const aggregateHeader = aggregate.header();
          eventStore.getFromSnapshot(
            aggregateHeader,
            (err, snapshot, stream) => {
              if (err) return reject(err);
              stream.addEvents(aggregate.pendingEvents());
              stream.commit((commitError) => {
                if (commitError) return reject(commitError);
                return aggregate.flushEvents();
              });
              const shouldDoSnapshot = snapshotStrategy({
                forceSnapshot,
                snapshotRevision: snapshot ? snapshot.revision : null,
                streamLastRevision: stream.lastRevision,
              });
              if (shouldDoSnapshot && typeof aggregate.snapshot === 'function') {
                const data = aggregate.snapshot();
                return eventStore.createSnapshot({
                  ...aggregate.header(),
                  streamId: aggregate.aggregateId(),
                  data,
                  revision: stream.lastRevision,
                }, (snapshotError) => {
                  if (snapshotError) return reject(snapshotError);
                  return resolve();
                });
              }
              return resolve();
            },
          );
        });
      },
      async loadEvents({ skip, limit, aggregateId }) {
        const queryHeader = header(aggregateId);
        return new Promise(((resolve, reject) => {
          eventStore.getEvents(queryHeader, skip, limit, (err, events) => {
            if (err) reject(err);
            resolve(events.map(it => ({
              ...queryHeader,
              aggregateId: it.aggregateId,
              payload: it.payload,
            })));
          });
        }));
      },
      async load(aggregateHeader) {
        return new Promise((resolve, reject) => {
          try {
            const sanitizedHeader = headerValidateSanitize(aggregateHeader);
            const { aggregateId } = sanitizedHeader;
            return eventStore.getFromSnapshot(
              sanitizedHeader,
              (err, snapshot, stream) => {
                if (err) return reject(err);
                const history = stream.events.map(it => it.payload) || [];
                try {
                  const dataSource = snapshot ? snapshot.data : aggregateId;
                  const loaded = recreateFrom(dataSource, history);
                  return resolve(loaded);
                } catch (e) {
                  return reject(e);
                }
              },
            );
          } catch (e) {
            return reject(e);
          }
        });
      },
    };
  };
}

module.exports = genericRepository;
