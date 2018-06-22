const mapObject = require('map-obj');

const BASE_PATH = '/banking/card';

function paginationLink(req) {
  return function paginationLinkWithBase({ skip, limit, results }) {
    console.log(results);
    const self = `<${req.url}; rel="self"`;
    const prevLink = skip > 0 ? `<${req.path}?skip=${Math.max(0, skip - limit)}&limit=${limit}>; rel="prev"` : '';
    const nextLink = results === limit ? `<${req.path}?skip=${skip + limit}&limit=${limit}>; rel="next"` : '';

    return [self, prevLink, nextLink].filter(x => x).join('; ');
  };
}

const commands = mapObject({
  WITHDRAWAL: '/withdrawal',
  LIMIT: '/limit',
  REPAYMENT: '/repayment',
}, (key, path) => [key, `${BASE_PATH}${path}`]);

const links = {
  BASE_PATH,
  commands,
  events: {
    FIRST_PAGE: `${BASE_PATH}/events/:aggregateId?`,
    paginationLink,
  },
  debug: {
    SINGLE_CARD: `${BASE_PATH}/:aggregateId`,
    singleCard: card => links.debug.card.replace(':aggregateId', card),
  },
};


module.exports = links;
