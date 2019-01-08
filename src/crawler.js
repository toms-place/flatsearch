const logErr = require('./logger').logErr;
const logOut = require('./logger').logOut;

const nlCrawler = require('./crawlers/nlCrawler');
const egwCrawler = require('./crawlers/egwCrawler');
const ebgCrawler = require('./crawlers/ebgCrawler');
const suCrawler = require('./crawlers/suCrawler');
const szbCrawler = require('./crawlers/szbCrawler');
const hbCrawler = require('./crawlers/heimbauCrawler');
const frCrawler = require('./crawlers/friedenCrawler');
const wsudCrawler = require('./crawlers/wsudCrawler');
const willCrawler = require('./crawlers/willCrawler');

class Crawler {
  constructor() {
    this.sites = {
      neuesleben: {
        url: "https://www.wohnen.at/angebot/unser-wohnungsangebot/",
        refreshRate: 5
      }
    };
    this.users = [];
  }

  async crawl() {

      let nl = new nlCrawler().crawl(this.users);
      let szb = new szbCrawler().crawl(this.users);
      let su = new suCrawler().crawl(this.users);
      let egw = new egwCrawler().crawl(this.users);
      let ebg = new ebgCrawler().crawl(this.users);
      let hb = new hbCrawler().crawl(this.users);
      let fr = new frCrawler().crawl(this.users);
      let wsud = new wsudCrawler().crawl(this.users);
      //let will = new willCrawler().crawl(this.users);

  }

  notify() {
    for (let user of this.users) {
      user.notify();
    }
  }
}

module.exports = Crawler;

