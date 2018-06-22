function eventTracker(apply) {
  const events = [];
  let appliedEvents = 0;
  return {
    applyWithRecord(event) {
      appliedEvents += 1;
      apply(event);
      events.push(event);
    },
    flushEvents() {
      events.length = 0;
    },
    pendingEvents() {
      return [...events];
    },
    appliedEvents() {
      return appliedEvents;
    },
  };
}

module.exports = eventTracker;
