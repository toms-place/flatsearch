const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;
const CronJob = require('cron').CronJob;
const flatListener = require('../flatListener');

class szbCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {

    const job = new CronJob('*/5 * * * *', async () => {
      try {
        //logOut('crawlSZB');
        this.newFlats = [];

        let url = 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/';

        if (process.env.NODE_ENV == 'dev') {
          url = 'http://127.0.0.1:8080/szb';
        }

        let res1 = await rp({
          'url': url,
          resolveWithFullResponse: true
        });

        let document = new JSDOM(res1.body).window.document;
        let angebot;
        let flats = [];

        if (document.querySelectorAll('.mobile-table')[0]) {
          angebot = document.querySelectorAll('.mobile-table')[0].querySelectorAll('tr');

          for (let i = 1; i < angebot.length; i++) {

            let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

            district = parseInt(angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[0]);
            city = angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[1];
            address = angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1];
            link = 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/';
            rooms = parseInt(angebot[i].querySelectorAll('td')[1].innerHTML);
            costs = angebot[i].querySelectorAll('td')[3].innerHTML;
            funds = angebot[i].querySelectorAll('td')[2].innerHTML;

            let flat = new Flat('SZB', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

            flats.push(JSON.stringify(flat));
          }

        }

        this.newFlats = await this.flatChecker.compare(flats);

        if (this.newFlats.length > 0) {
          flatListener.emit('newFlat', this.newFlats);
        }

      } catch (error) {
        logErr(error);
      }

    }, null, null, "Europe/Amsterdam", null, true);
    job.start();
  }
}

module.exports = szbCrawler;