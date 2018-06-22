const ClientError = require('../../lib/shared/clientError');

function commands({ trackEvent, invariants, eventsCreator }) {
  return {
    assignLimit(amount) {
      if (invariants.limitAlreadyAssigned()) {
        throw new ClientError('Cannot assign limit for the second time');
      }
      trackEvent(eventsCreator.limitAssigned(amount));
    },
    withdraw(amount) {
      if (invariants.notEnoughMoney(amount)) {
        throw new ClientError('Not enough money');
      }
      if (!invariants.limitAlreadyAssigned()) {
        throw new ClientError('No limit assigned');
      }
      trackEvent(eventsCreator.cardWithdrawn(amount));
    },
    repay(amount) {
      trackEvent(eventsCreator.cardRepaid(amount));
    },
  };
}
module.exports = commands;
