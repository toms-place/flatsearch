const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;

class NAMECrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    try {
      logOut('crawlNAME');

      this.newFlats = [];

      let url = 'URL';

      const res1 = await rp({
        'url': url,
        resolveWithFullResponse: true
      });

      let document = new JSDOM(res1.body).window.document;
      let angebot = document.querySelectorAll('');

      let flats = []
      for (let i = 0; i < singleFlatsRequests.length; i++) {

        try {
        let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, images, info, docs;

        address = '';
        district = '';
        city = '';
        link = '';
        rooms = '';
        size = '';
        legalform = '';
        title = '';
        status = '';
        info = '';
        docs = '';

        let flat = new Flat('NAME', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
        await flats.push(JSON.stringify(flat));

        } catch (error) {
          logOut(singleFlatsRequests[i].res.request.uri.href);
          logErr(error);
        }
      }

      this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

    return;

  }
}

module.exports = NAMECrawler;