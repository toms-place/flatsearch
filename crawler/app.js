const numeral = require('numeral');
// load a locale
numeral.register('locale', 'de', {
  delimiters: {
    thousands: '.',
    decimal: ','
  },
  abbreviations: {
    thousand: 'k',
    million: 'm'
  },
  currency: {
    symbol: '€'
  }
});
numeral.register('locale', 'en-gb', {
  delimiters: {
      thousands: ',',
      decimal: '.'
  },
  abbreviations: {
      thousand: 'k',
      million: 'm'
  },
  currency: {
    symbol: '£'
  }
});
// switch between locales (standard = de)
numeral.locale('de');

/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
//configuration ===============================================================
mongoose.connect(configDB.url, {
  useNewUrlParser: true
}); // connect to our database

/** CRON TAB: seconds, minutes, hours, days, months, years */

const Notifier = require('./lib/notifier');
const notifier = new Notifier();
if (process.env.NODE_ENV == 'dev') {
  notifier.startCron('*/50 * * * * *');
} else {
  notifier.startCron('30 */1 * * * *');
}


/** Website List:
 * 
 * https://www.wohnen.at/
 * http://www.egw.at/
 * http://www.ebg-wohnen.at/
 * http://www.siedlungsunion.at/
 * https://www.sozialbau.at/
 * https://www.heimbau.at/
 * https://www.frieden.at/
 * https://www.wiensued.at/
 * https://www.willhaben.at/iad/
 */

const nlCrawler = require('./crawlers/nlCrawler');
const egwCrawler = require('./crawlers/egwCrawler');
const ebgCrawler = require('./crawlers/ebgCrawler');
const suCrawler = require('./crawlers/suCrawler');
const szbCrawler = require('./crawlers/szbCrawler');
const hbCrawler = require('./crawlers/heimbauCrawler');
const frCrawler = require('./crawlers/friedenCrawler');
const wsudCrawler = require('./crawlers/wsudCrawler');
const willCrawler = require('./crawlers/willCrawler');
const testCrawler = require('./crawlers/testCrawler');

if (process.env.NODE_ENV == 'dev') {
  new testCrawler(true).crawl('*/5 * * * * *');
  new nlCrawler(true).crawl('0 */1 * * * *');
  new szbCrawler(true).crawl('0 */1 * * * *');
  new suCrawler(true).crawl('0 */1 * * * *');
  new egwCrawler(true).crawl('0 */1 * * * *');
  new ebgCrawler(true).crawl('0 */1 * * * *');
  new hbCrawler(true).crawl('0 */1 * * * *');
  new frCrawler(true).crawl('0 */1 * * * *');
  new wsudCrawler(true).crawl('0 */1 * * * *');
  new willCrawler(true).crawl('0 */1 * * * *');
} else {
  let nl = new nlCrawler().crawl('0 */5 * * * *');
  let szb = new szbCrawler().crawl('0 */5 * * * *');
  let su = new suCrawler().crawl('0 */5 * * * *');
  let egw = new egwCrawler().crawl('0 */5 * * * *');
  let ebg = new ebgCrawler().crawl('0 */5 * * * *');
  let hb = new hbCrawler().crawl('0 */5 * * * *');
  let fr = new frCrawler().crawl('0 */5 * * * *');
  let wsud = new wsudCrawler().crawl('0 */5 * * * *');
  let will = new willCrawler().crawl('0 0 */1 * * *');

}