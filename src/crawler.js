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

class Crawler {
  crawl() {

      let nl = new nlCrawler().crawl();
      let szb = new szbCrawler().crawl();
      let su = new suCrawler().crawl();
      let egw = new egwCrawler().crawl();
      let ebg = new ebgCrawler().crawl();
      let hb = new hbCrawler().crawl();
      let fr = new frCrawler().crawl();
      let wsud = new wsudCrawler().crawl();
      let will = new willCrawler().crawl();
      //let test = new testCrawler().crawl();

  }
}

module.exports = Crawler;

