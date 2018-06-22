const recreateFromFactory = require('./recreateFromFactory');
const eventTracker = require('./eventTracker');
const { headerFactory } = require('./headerFactory');

function wrapApplyToMutateAndReturnState(apply, state) {
  return function wrapped({ type, ...payload }) {
    apply(state, { type, payload });
    return state;
  };
}

function aggregateFactory({ apply, header, newInstance, initialState = {} }) {
  const headerWithType = headerFactory(header);
  return function wrapWithClock({ clock = () => new Date() } = {}) {
    function newInstanceWithTracker(aggregateId, newState = {}) {
      const state = { ...initialState, ...newState };
      const wrappedApply = wrapApplyToMutateAndReturnState(apply, state);
      const tracker = eventTracker(wrappedApply, state);
      return {
        ...newInstance({ aggregateId, trackEvent: tracker.applyWithRecord, state, clock }),
        ...tracker,
        snapshot() {
          return { data: { ...state }, aggregateId };
        },
        aggregateId: () => aggregateId,
        header: () => headerWithType(aggregateId),
        apply: wrappedApply,
      };
    }
    return {
      ...recreateFromFactory(newInstanceWithTracker),
      header: headerWithType,
      aggregate: id => newInstanceWithTracker(id),
    };
  };
}

module.exports = aggregateFactory;
