const Flat = require('../model/flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;
const CronJob = require('cron').CronJob;
const fs = require('../Filereader');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;

class testCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    const job = new CronJob('*/10 * * * * *', async () => {
      try {
        console.log('executing testCrawler.js');
        this.newFlats = [];

        let url = 'su.html';

        let dom = await JSDOM.fromFile(url, {
          contentType: "text/html"
        });
        let angebot = dom.window.document.querySelectorAll('article');
        
        let flats = [];

        for (let i = 0; i < angebot.length; i++) {

          let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

          district = parseInt(angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[0]);
          address = angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1].trim();
          city = angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[1];
          link = 'http://www.siedlungsunion.at' + angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].href;
          rooms = parseInt(angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[0].innerHTML.split(' ')[0]);
          costs = angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[2].textContent.split(' ')[0];
          size = angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[1].textContent;

          let flat = new Flat('SU', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

          flats.push(flat);
        }

        this.newFlats = await this.flatChecker.compare(flats);

      } catch (error) {
        console.log(error);
      }

    }, null, null, "Europe/Amsterdam", null, true);
    job.start();

  }
}

module.exports = testCrawler;