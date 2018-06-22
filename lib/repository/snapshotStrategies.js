function snapshotEveryXRevisions(x) {
  return ({ forceSnapshot, snapshotRevision, streamLastRevision }) => {
    if (forceSnapshot) return true;
    if ((streamLastRevision - snapshotRevision) > x) {
      return true;
    }
    return false;
  };
}

module.exports = {
  snapshotEveryXRevisions,
  noSnapshot: () => false,
};
