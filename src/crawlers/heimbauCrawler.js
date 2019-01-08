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

class heimbauCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl(users) {

    const job = new CronJob('*/5 * * * *', async () => {
      try {
        //logOut('crawlHeimbauNeubau');
        this.newFlats = [];

        let url = 'https://www.heimbau.at/wohnungen';

        let res1 = await rp({
          'url': url,
          resolveWithFullResponse: true,
          "rejectUnauthorized": false
        });

        let document = new JSDOM(res1.body).window.document;
        let angebot = document.querySelectorAll('#three')[0].querySelectorAll('tr');


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
          let address = res2arr[i].angebot.querySelectorAll('a')[1].innerHTML;
          let city = innerDoc.querySelectorAll('.object-detail-address')[0].innerHTML.split(',').pop().split('.')[0].trim().split(' ')[1];
          let link = res2arr[i].res.request.uri.href;
          let docs;
          let images;
          let status;
          let rooms;
          let size;
          let costs;
          let funds;

          let stat;

          let stats = res2arr[i].angebot.querySelectorAll('.td-center');
          for (let key in stats) {
            if (stats[key].innerHTML == '<img src="/images/x.png" alt="x">') {
              stat = key;
            }
          }


          switch (stat) {
            case '0':
              status = 'Bezugsfertig'
              break;
            case '1':
              status = 'In Bau'
              break;
            case '2':
              status = 'In Planung'
              break;
            case '3':
              status = 'Wiedervermietung'
              break;

            default:
              break;
          }

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

          if (innerDoc.querySelectorAll('.object-pictures-cont').length > 0) {
            images = [];
            let tempImgs = innerDoc.querySelectorAll('.object-pictures-cont')[0].querySelectorAll('img');
            if (tempImgs) {
              for (let img of tempImgs) {
                images.push({
                  src: 'https://www.heimbau.at' + img.src
                });
              }
            }
          }

          /*
          if (innerDoc.querySelectorAll('.object-pictures-cont')) {
            images = innerDoc.querySelectorAll('.object-pictures-cont')[0].querySelectorAll('img');
          }*/

          let flat = new Flat('Heimbau', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

          flats.push(JSON.stringify(flat));
        }

        this.newFlats = await this.flatChecker.compare(flats);

        if (this.newFlats.length > 0) {
          flatListener.emit('newFlat', this.newFlats, users);
        }

      } catch (error) {
        logErr(error);
      }

    }, null, null, "Europe/Amsterdam", null, true);
    job.start();
  }
}

module.exports = heimbauCrawler;