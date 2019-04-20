const Flat = require('../model/flat');
const FlatChecker = require('../lib/flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../lib/logger').logErr;
const logOut = require('../lib/logger').logOut;
const CronJob = require('cron').CronJob;

class szbCrawler {
  constructor(initOutput) {
    this.flatChecker = new FlatChecker(initOutput);
    this.newFlats = [];
  }

  async crawl(cron) {

    const job = new CronJob(cron, async () => {
      try {
        //logOut('crawlSZB');
        this.newFlats = [];

        let url = 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/';

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

            let tempCosts = parseFloat(reverseFormatNumber(costs.split(";")[1],'de'));
            if (!isNaN(tempCosts)) {
              costs = tempCosts;
            }

            let flat = new Flat('SZB', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

            flats.push(flat);
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

module.exports = szbCrawler;

function reverseFormatNumber(val,locale){
  var group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, '');
  var decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');
  var reversedVal = val.replace(new RegExp('\\' + group, 'g'), '');
  reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
  return Number.isNaN(reversedVal)?0:reversedVal;
}