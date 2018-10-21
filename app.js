const server = require('./tests/www');
const Crawler = require('./lib/crawler');

if (process.env.NODE_ENV == 'dev') {
  server.listen(process.env.PORT || 8080);
}

const crawler = new Crawler('0 */5 9-17 * * *');
crawler.startJob();