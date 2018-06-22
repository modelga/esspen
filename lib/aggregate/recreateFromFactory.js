module.exports = function recreateFromFactory(newInstance) {
  function fromSnapshot({ aggregateId, data }) {
    return newInstance(aggregateId, data);
  }
  function sourceFactory(idOrSnapshot) {
    return typeof idOrSnapshot === 'string'
      ? newInstance(idOrSnapshot)
      : fromSnapshot(idOrSnapshot);
  }
  function recreateFromEventStep(aggregate, event) {
    return newInstance(
      aggregate.aggregateId(),
      aggregate.apply(event),
    );
  }
  return {
    recreateFrom(idOrSnapshot, events) {
      return events.reduce(
        recreateFromEventStep,
        sourceFactory(idOrSnapshot),
      );
    },
  };
};
