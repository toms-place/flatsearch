const Flat = require('../model/flat');
const FlatChecker = require('../lib/flatchecker');
const logErr = require('../lib/logger').logErr;
const logOut = require('../lib/logger').logOut;
const CronJob = require('cron').CronJob;

const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;


class ebgCrawler {
  constructor(initOutput) {
    this.flatChecker = new FlatChecker(initOutput);
    this.newFlats = [];
  }

  async crawl(cron) {

    const job = new CronJob(cron, async () => {
      try {

        //logOut('crawlEBG');
        this.newFlats = [];

        let url = 'http://www.ebg-wohnen.at/Suche.aspx';

        if (process.env.NODE_ENV == 'dev') {
          url = 'http://127.0.0.1:8080/ebg';
        }

        let flats = [];

        let res1 = await rp({
          'url': url,
          resolveWithFullResponse: true
        });

        let document = new JSDOM(res1.body).window.document;
        let angebot = document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');

        let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

        for (let i = 0; i < angebot.length; i++) {
          link = 'http://www.ebg-wohnen.at/' + angebot[i].getAttribute("onclick").split('\'')[1];
          if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
            address = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1].trim();
            district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
            city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
            rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
          } else {
            address = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
            district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
            city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
            rooms = "deeper search necessary"
          }

          let flat = new Flat('EBG', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

          flats.push(flat);
        }

        this.newFlats = await this.flatChecker.compare(flats);

      } catch (error) {
        logErr(error);
      }

    }, null, null, "Europe/Amsterdam", null, true);
    job.start();

  }
}

module.exports = ebgCrawler;