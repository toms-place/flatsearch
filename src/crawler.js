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
    this.nl = new nlCrawler();
    this.szb = new szbCrawler();
    this.su = new suCrawler();
    this.egw = new egwCrawler();
    this.ebg = new ebgCrawler();
    this.hb = new hbCrawler();
    this.fr = new frCrawler();
    this.wsud = new wsudCrawler();
    this.will = new willCrawler();
  }
  async crawl() {
    logOut('startCrawl');

    if (process.env.NODE_ENV == 'dev') {
      let newFlats = [];
  
      let promises = [this.will.crawl()];
  
      await Promise.all(promises);
  
      let flats = [this.will.newFlats];
  
      await combine(newFlats, flats);
  
      return newFlats;

    } else {

      let newFlats = [];

      let promises = [
        this.nl.crawl()
        , this.szb.crawl()
        , this.su.crawl()
        , this.egw.crawl()
        , this.ebg.crawl()
        , this.hb.crawl()
        , this.fr.crawl()
        , this.wsud.crawl()
        , this.will.crawl()
      ];

      await Promise.all(promises);

      let flats = [this.hb.newFlats
        , this.nl.newFlats
        , this.szb.newFlats
        , this.su.newFlats
        , this.egw.newFlats
        , this.ebg.newFlats
        , this.fr.newFlats
        , this.wsud.newFlats
        , this.will.newFlats
      ];

      await combine(newFlats, flats);

      return newFlats;
    }

  }
}

module.exports = Crawler;

function combine(arr1, arr2) {
  for (let a = 0; a < arr2.length; a++) {
    if (arr1.length > 0) {
      arr1.concat(arr2[a]);
    }
    try {
      for (let i of arr2[a]) {
        arr1.push(i)
      }
    } catch (err) {
      logErr(err);
    }
  }
}