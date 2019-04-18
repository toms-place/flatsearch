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
notifier.startCron('*/10 * * * * *');


const nlCrawler = require('./crawlers/nlCrawler');
const egwCrawler = require('./crawlers/egwCrawler');
const ebgCrawler = require('./crawlers/ebgCrawler');
const suCrawler = require('./crawlers/suCrawler');
const szbCrawler = require('./crawlers/szbCrawler');
const hbCrawler = require('./crawlers/heimbauCrawler');
const frCrawler = require('./crawlers/friedenCrawler');
const wsudCrawler = require('./crawlers/wsudCrawler');
const willCrawler = require('./crawlers/willCrawler');
//const testCrawler = require('./crawlers/testCrawler');

let nl = new nlCrawler(true).crawl('0 */5 * * * *');
let szb = new szbCrawler().crawl('0 */5 * * * *');
let su = new suCrawler().crawl('0 */5 * * * *');
let egw = new egwCrawler().crawl('0 */5 * * * *');
let ebg = new ebgCrawler().crawl('0 */5 * * * *');
let hb = new hbCrawler().crawl('0 */5 * * * *');
let fr = new frCrawler().crawl('0 */5 * * * *');
let wsud = new wsudCrawler().crawl('0 */5 * * * *');
let will = new willCrawler().crawl('0 0 */1 * * *');
//let test = new testCrawler(true).crawl('*/5 * * * * *');