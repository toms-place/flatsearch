const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;

class nlCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    try {
      //logOut('crawlNL');

      this.newFlats = [];

      let url = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/';

      const res1 = await rp({
        'url': url,
        resolveWithFullResponse: true
      });

      let document = new JSDOM(res1.body).window.document;
      let angebot = document.querySelectorAll('.unstyled');

      let res2arr = [];
      for (let i = 0; i < angebot.length; i++) {
        let amount = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML)
        if (amount > 0) {
          let res2 = await rp({
            'url': 'https://www.wohnen.at' + angebot[i].href,
            resolveWithFullResponse: true
          });
          let building = {
            res: res2,
            angebot: angebot[i]
          };
          await res2arr.push(building);
        }
      }

      let singleFlatsRequests = [];
      for (let i = 0; i < res2arr.length; i++) {
        let document = new JSDOM(res2arr[i].res.body).window.document;
        if (document.querySelectorAll('.units-table')[0] !== undefined) {
          let allFlatsOfBuilding = document.querySelectorAll('.units-table')[0].querySelectorAll('.row');
          for (let x = 0; x < allFlatsOfBuilding.length; x++) {
            let singleFlat = {
              res: await rp({
                'url': 'https://www.wohnen.at' + allFlatsOfBuilding[x].querySelectorAll('div')[0].getAttribute("onclick").split('\'')[1],
                resolveWithFullResponse: true
              }),
              singleFlat: allFlatsOfBuilding[x],
              building: res2arr[i],
            };
            await singleFlatsRequests.push(singleFlat);
          }
        }
      }

      let flats = []
      for (let i = 0; i < singleFlatsRequests.length; i++) {

        let buildingDoc = new JSDOM(singleFlatsRequests[i].building.res.body).window.document;
        let flatDoc = new JSDOM(singleFlatsRequests[i].res.body).window.document;
        let angebot = singleFlatsRequests[i].building.angebot;
        let singleFlat = singleFlatsRequests[i].singleFlat;

        let district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, images;
        let info = '';
        let docs = [];

        adress = singleFlat.querySelectorAll('span')[0].innerHTML.trim();
        [district, city] = buildingDoc.querySelectorAll('.building-page')[0].querySelectorAll('h1')[0].innerHTML.split(',')[0].split(' ');
        link = singleFlatsRequests[i].res.request.uri.href;
        rooms = singleFlat.querySelectorAll('.room')[0].innerHTML;
        size = singleFlat.querySelectorAll('.area')[0].innerHTML;
        legalform = singleFlat.querySelectorAll('.legalForm')[0].innerHTML;
        title = angebot.querySelectorAll('.title')[0].innerHTML.trim();
        status = angebot.querySelectorAll('.tile-ribbon')[0].innerHTML.trim();
        if (flatDoc.querySelectorAll('.description')[0]) {
          info += flatDoc.querySelectorAll('.description')[0].innerHTML;
        }
        if (flatDoc.querySelectorAll('.master-data')[0]) {
          info += flatDoc.querySelectorAll('.master-data')[0].innerHTML;
        }

        let tempDocs = flatDoc.querySelectorAll('.materials')[0].querySelectorAll('a');
        if (tempDocs) {
          for (let doc of tempDocs) {
            docs.push({
              href: 'https://www.wohnen.at' + doc.href,
              text: doc.innerHTML
            });
          }
        }

        //find financing details
        let financing = flatDoc.querySelectorAll('.financing-variant-column');
        if (financing.length > 0) {
          for (let i = 0; i < financing.length; i++) {
            switch (financing[i].querySelectorAll('.financing-title')[0].innerHTML) {
              case 'monatliche Kosten:':
                costs = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
                break;
              case 'Kaution:':
                deposit = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
                break;
              case 'Eigenmittel:':
                funds = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
                break;
              default:
                break;
            }
          }
        }

        let flat = new Flat('Neuesleben', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
        await flats.push(JSON.stringify(flat));
      }

      this.newFlats = await this.flatChecker.compare(flats);

    } catch (error) {
      logErr(error);
    }

    return;

  }
}

module.exports = nlCrawler;