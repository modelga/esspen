function headerFactory({ aggregate, context }) {
  return aggregateId => ({
    aggregateId,
    aggregate,
    context,
  });
}
exports.headerFactory = headerFactory;
