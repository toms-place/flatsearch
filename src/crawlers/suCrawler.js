const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;

class suCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    try {
      //logOut('crawlSU');
      this.newFlats = [];
      
      let url = 'http://www.siedlungsunion.at/wohnen/sofort';

      if (process.env.NODE_ENV == 'dev') {
        url = 'http://127.0.0.1:8080/su';
      }

      let res1 = await rp({
        'url': url,
        resolveWithFullResponse: true
      });

      let document = new JSDOM(res1.body).window.document;
      let angebot = document.querySelectorAll('article');


      let flats = [];

      for (let i = 1; i < angebot.length; i++) {

        let district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

        district = parseInt(angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[0]);
        adress = angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1].trim();
        city = angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[1];
        link = 'http://www.siedlungsunion.at' + angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].href;
        rooms = parseInt(angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[0].innerHTML.split(' ')[0]);
        costs = angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[2].textContent.split(' ')[0];
        size = angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[1].textContent;

        let flat = new Flat('SU', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

        flats.push(JSON.stringify(flat));
      }

      this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

    return;

  }
}

module.exports = suCrawler;