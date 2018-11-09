const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;



class wsudCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    try {
      //logOut('crawlNL');

      this.newFlats = [];

      let url = 'https://www.wiensued.at/suche/Sofort-verf%C3%BCgbar';

      let cookie = rp.jar();

      const res1 = await rp({
        'url': url,
        jar: cookie,
        resolveWithFullResponse: true
      });

      let document = new JSDOM(res1.body, { runScripts: "dangerously" }).window.document;

      console.log(document);

      //let angebot = document.querySelectorAll('.search-result-control')[0].querySelectorAll('.mb-4');

      let flats = [];

      for (let i = 0; i < angebot.length; i++) {

        //console.log(angebot);

        //let flat = new Flat('Neuesleben', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
        //await flats.push(JSON.stringify(flat));
      }

      //this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

    return;

  }
}

module.exports = wsudCrawler;