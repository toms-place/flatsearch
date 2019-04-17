const Flat = require('../model/flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const logErr = require('../logger').logErr;
const CronJob = require('cron').CronJob;

class wsudCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {

    const job = new CronJob('* */5 * * * *', async () => {
      try {
        //logOut('crawlWSUD');
        this.newFlats = [];

        let api = 'https://www.wiensued.at/api/project/list';

        const res = await rp.get({
          'url': api,
          headers: {
            'method': 'GET',
            'path': '/api/project/list',
            'scheme': 'https',
            'dnt': '1',
            'referer': 'https://www.wiensued.at/suche/Sofort-verf%C3%BCgbar',
            'accept': '*/*',
            'accept-encoding': '',
            'accept-language': 'en-AT,en;q=0.9,de-AT;q=0.8,de;q=0.7,en-US;q=0.6',
          },
          resolveWithFullResponse: true
        });

        let flats = [];
        let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

        for (let project of JSON.parse(res.body)) {
          if (project.units.length > 0) {
            district = project.plz;
            city = project.city;
            status = project.status;
            title = project.developer;
            link = 'https://www.wiensued.at/project/' + project.projectName

            let infoTemp = project.shortDescription;
            let street = project.street;

            let imgFlag = false;

            if (project.images.length > 0) {
              images = [];
              for (let img of project.images) {
                images.push({
                  src: 'https://www.wiensued.at' + img.src
                })
              }

              for (let unit of project.units) {

                address = street + ' (ID: ' + unit.id + ')'
                costs = unit.sampleRent;
                funds = unit.samplePrice;
                size = unit.size;
                info = infoTemp + '<br />' + unit.description;
                rooms = unit.rooms;

                if (unit.images.length > 0) {
                  if (!imgFlag) images = [];
                  for (let img of unit.images) {
                    images.push({
                      src: 'https://www.wiensued.at' + img.src
                    });
                  }
                }

                let flat = new Flat('Wien Süd', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

                await flats.push(flat);

              }
            }
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

module.exports = wsudCrawler;