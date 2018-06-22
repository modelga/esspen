const commands = require('./cardCommands');
const eventsCreatorFactory = require('./eventsCreator');
const aggregateFactory = require('../../lib/aggregate/aggregateFactory');

function invariantsFactory(state) {
  const inv = {
    limitAlreadyAssigned() {
      return state.limit != null;
    },
    availableLimit() {
      return state.limit - state.used;
    },
    notEnoughMoney(amount) {
      return amount > inv.availableLimit();
    },
  };
  return inv;
}

function apply(state, { type, payload }) {
  const { CARD_REPAID, LIMIT_ASSIGNED, CARD_WITHDRAWN } = require('./eventsType');
  if (type === CARD_REPAID) {
    state.used -= payload.amount;
  } else if (type === LIMIT_ASSIGNED) {
    state.limit = payload.amount;
  } else if (type === CARD_WITHDRAWN) {
    state.used += payload.amount;
  }
}

function newInstance({ aggregateId, trackEvent, state, clock }) {
  const eventsCreator = eventsCreatorFactory(clock);
  const invariants = invariantsFactory(state);
  return {
    ...invariants,
    ...commands({ invariants, eventsCreator, trackEvent }),
    data: () => ({ limit: invariants.availableLimit(), uuid: aggregateId }), // debug accessor
  };
}
module.exports = aggregateFactory({
  header: { aggregate: 'card', context: 'banking' },
  apply,
  newInstance,
  initialState: {
    limit: undefined,
    used: 0,
  },
});

