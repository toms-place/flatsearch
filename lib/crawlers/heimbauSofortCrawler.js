const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const initial = require('lodash.initial');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;

class szbCrawler {
  constructor() {
    this.flatChecker = new FlatChecker(true);
    this.newFlats = [];
  }

  async crawl() {
    logOut('crawlHeimbauSofort');
    this.newFlats = [];

    let url = 'https://www.heimbau.at/wohnungen/wiedervermietung';

    let res1 = await rp({
      'url': url,
      resolveWithFullResponse: true,
      "rejectUnauthorized": false
    });

    let document = new JSDOM(res1.body).window.document;
    let angebot = document.querySelectorAll('#two')[0].querySelectorAll('tr');


    let res2arr = [];
    for (let i = 2; i < angebot.length; i++) {
      let href = angebot[i].querySelectorAll('a')[0].href;
      let res2 = await rp({
        'url': 'https://www.heimbau.at' + href,
        resolveWithFullResponse: true,
        "rejectUnauthorized": false
      });
      let building = {
        res: res2,
        angebot: angebot[i]
      };
      await res2arr.push(building);
    }

    let flats = [];
    for (let i = 0; i < res2arr.length; i++) {

      let deposit, legalform, title, info;

      let innerDoc = new JSDOM(res2arr[i].res.body).window.document;

      let district = res2arr[i].angebot.querySelectorAll('a')[0].innerHTML;
      let adress = initial(innerDoc.querySelectorAll('.object-detail-address')[0].innerHTML.split(','))[0];
      let city = innerDoc.querySelectorAll('.object-detail-address')[0].innerHTML.split(',').pop().split('.')[0].trim().split(' ')[1];
      let link = res2arr[i].res.request.uri.href;
      let docs;
      let images;
      let status;
      let rooms;
      let size ;
      let costs;
      let funds;

      /*
      let stats = angebot[i].querySelectorAll('.td-center');
      for (s = 0; s < stats.length; s++) {
        if (stats[s].querySelectorAll('img').length > 0) {
          switch (s) {
            case 0:
              status = 'Bezugsfertig';
              break;
            case 1:
              status = 'In Bau';
              break;
            case 2:
              status = 'In Planung';
              break;
            default:
              status = 'Not found';
              break;
          }
        }
      }*/


      if (innerDoc.querySelectorAll('.object-files-cont').length > 0) {
        docs = [];
        let tempDocs = innerDoc.querySelectorAll('.object-files-cont')[0].querySelectorAll('li a');
        if (tempDocs) {
          for (let doc of tempDocs) {
            docs.push({
              href: 'https://www.heimbau.at' + doc.href,
              text: doc.innerHTML
            });
          }
        }
      }

      /*
      if (innerDoc.querySelectorAll('.object-pictures-cont')) {
        images = innerDoc.querySelectorAll('.object-pictures-cont')[0].querySelectorAll('img');
      }*/

      let flat = new Flat('Heimbau', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

      flats.push(JSON.stringify(flat));
    }

    this.newFlats = await this.flatChecker.compare(flats);

    return;
  }

}

module.exports = szbCrawler;