const Flat = require('../model/flat');
const FlatChecker = require('../lib/flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../lib/logger').logErr;
const logOut = require('../lib/logger').logOut;
var base64 = require('base-64');
var utf8 = require('utf8');
const CronJob = require('cron').CronJob;

class willCrawler {
  constructor(initOutput) {
    this.flatChecker = new FlatChecker(initOutput);
    this.newFlats = [];
  }

  async crawl(cron) {

    const job = new CronJob(cron, async () => {
    try {
      logOut('crawlWillhaben');

      this.newFlats = [];

      let url = 'https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote';

      const res1 = await rp({
        'url': url,
        resolveWithFullResponse: true,
        encoding: 'latin1'
      });

      let document = new JSDOM(res1.body).window.document;
      let angebot = document.querySelectorAll('.result-list')[0].querySelectorAll('article');

      let flats = []

      for (let i = 0; i < angebot.length; i++) {
        try {
          //eliminate ads
          if (angebot[i].getAttribute("itemtype") == 'http://schema.org/Residence') {
            let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, images, info, docs;
            let addressLine = angebot[i].querySelectorAll('.addressLine')[0].querySelectorAll('div')[1].innerHTML.trim();

            if (addressLine.match(/[0-9]{4}/)) {
              district = addressLine.match(/[0-9]{4}/)[0];
            } else {
              continue;
            }
            if (addressLine.match(",")) {
              if (addressLine.split(",")[0].trim().match("\n")) {
                address = addressLine.split(",")[0].trim().split(" ")[addressLine.split(",")[0].trim().split(" ").length - 1];
              } else {
                address = decodeURI(addressLine.split(",")[0].trim());
              }
              city = addressLine.split(",")[1].trim().split(" ")[addressLine.split(",")[1].trim().split(" ").length - 1];
            } else {
              city = addressLine.split(" ")[addressLine.split(" ").length - 1];
              address = district + " " + city;
            }
            link = 'https://www.willhaben.at' + angebot[i].querySelectorAll('.header')[0].querySelectorAll('a')[0].href;
            size = parseInt(angebot[i].querySelectorAll('.desc-left')[0].innerHTML.trim());

            /* Willhaben encodes the span with the price in base64 */
            let encoded = angebot[i].querySelectorAll('.info')[0].querySelectorAll('script')[0].innerHTML.split("'")[3];
            let bytes = base64.decode(encoded);
            costs = utf8.decode(bytes).trim().split(" ")[2];

            title = angebot[i].querySelectorAll('.header')[0].querySelectorAll('a')[0].textContent.trim();
            images = [{
              src: angebot[i].querySelectorAll('.image-section')[0].querySelectorAll('img')[0].src
            }]

            let flat = new Flat('Willhaben', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
            await flats.push(flat);
          }
        } catch (error) {
          logErr(error);
        }
      }

    this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

  }, null, null, "Europe/Amsterdam", null, true);
  job.start();
  }
}

module.exports = willCrawler;