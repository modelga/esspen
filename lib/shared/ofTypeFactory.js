const ofTypeFactory = ({ clock }) => type => payload => ({
  time: clock().toJSON(), type, ...payload,
});
module.exports = ofTypeFactory;
