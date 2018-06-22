const { ofTypeFactory } = require('../../lib');

const { CARD_REPAID, LIMIT_ASSIGNED, CARD_WITHDRAWN } = require('./eventsType');

module.exports = (clock) => {
  const ofType = ofTypeFactory({ clock });
  return {
    limitAssigned(amount) {
      return ofType(LIMIT_ASSIGNED)({ amount });
    },
    cardRepaid(amount) {
      return ofType(CARD_REPAID)({ amount });
    },
    cardWithdrawn(amount) {
      return ofType(CARD_WITHDRAWN)({ amount });
    },
  };
};
