const Flat = require('../model/flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;
const CronJob = require('cron').CronJob;

class friedenCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
    this.body = '';
  }

  async crawl() {

    const job = new CronJob('0 */5 * * * *', async () => {
    try {
      //logOut('crawlFrieden');

      this.newFlats = [];
      let flats = [];

      let document = new JSDOM(await this.getBody()).window.document;
      let angebot = document.querySelectorAll('.batch-units tr');

      let street;
      let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

      for (let i = 0; i < angebot.length; i++) {

        if (angebot[i].querySelectorAll('.street').length > 0) {
          street = angebot[i].querySelectorAll('.street')[0].querySelectorAll('strong')[0].innerHTML;
          let [destination, ...rest] = street.split(',')[0].split(' ');
          district = destination;
          city = rest[0];
          continue;
        } else if (angebot[i].querySelectorAll('a').length > 0) {
          address = street + ' ' + angebot[i].querySelectorAll('.first .anchor')[0].innerHTML;
          link = 'http://www.frieden.at' + angebot[i].querySelectorAll('.first')[0].getAttribute("onclick").split('\'')[1];
        }


        let flat = new Flat('Frieden', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

        flats.push(flat);
      }

      this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

  }, null, null, "Europe/Amsterdam", null, true);
  job.start();

  }
  async getBody() {

    let body = '';
    let url = 'http://www.frieden.at/umbraco/Surface/ProjectSearch/InfiniteProjects/';
    let crawlCount = 0;
    let flag = true;

    while (flag) {
      if (process.env.NODE_ENV == 'dev') {
        if (crawlCount == 5) break;
      }
      let res = await rp.post({
        'url': url,
        formData: {
          RequestCount: crawlCount
        },
        resolveWithFullResponse: true
      }).catch((err) => {
        logErr(err);
      });
      if (res.statusCode == 204) {
        flag = false;
        break;
      }
      body += res.body;
      crawlCount++;
    }

    return body;
  }
}

module.exports = friedenCrawler;