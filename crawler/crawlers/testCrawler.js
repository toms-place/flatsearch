const Flat = require('../model/flat');
const FlatChecker = require('../lib/flatchecker');
const rp = require('request-promise');
const logErr = require('../lib/logger').logErr;
const logOut = require('../lib/logger').logOut;
const CronJob = require('cron').CronJob;
const fs = require('../lib/Filereader');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;

class testCrawler {
  constructor(initOutput) {
    this.flatChecker = new FlatChecker(initOutput);
    this.newFlats = [];
  }

  async crawl(cron) {
    const job = new CronJob(cron, async () => {
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

          let tempCosts = parseFloat(reverseFormatNumber(costs,'en'));
          if (!isNaN(tempCosts)) {
            costs = tempCosts;
          }
          
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

function reverseFormatNumber(val,locale){
  var group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, '');
  var decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');
  var reversedVal = val.replace(new RegExp('\\' + group, 'g'), '');
  reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
  return Number.isNaN(reversedVal)?0:reversedVal;
}