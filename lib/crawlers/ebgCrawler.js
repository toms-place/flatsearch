const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;

const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;

class ebgCrawler {
  constructor() {
    this.flatChecker = new FlatChecker(true);
    this.newFlats = [];
  }

  async crawl() {
    logOut('crawlEBG');
    this.newFlats = [];

    let url = 'http://www.ebg-wohnen.at/Suche.aspx';

    let flats = [];

    let res1 = await rp({
      'url': url,
      resolveWithFullResponse: true
    });

    let document = new JSDOM(res1.body).window.document;
    let angebot = document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');

    let district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

    for (let i = 0; i < angebot.length; i++) {
      link = 'http://www.ebg-wohnen.at/' + angebot[i].getAttribute("onclick").split('\'')[1];
      if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
        adress = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1].trim();
        district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
        city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
        rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
      } else {
        adress = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
        district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
        city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
        rooms = "deeper search necessary"
      }

      let flat = new Flat('EBG', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

      flats.push(JSON.stringify(flat));
    }

    this.newFlats = await this.flatChecker.compare(flats);

    return;
  }

}

module.exports = ebgCrawler;