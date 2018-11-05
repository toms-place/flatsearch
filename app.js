const Crawler = require('./lib/crawler');
const CronJob = require('cron').CronJob;
const FlatChecker = require('./lib/flatchecker');
const flatChecker = new FlatChecker();
const logErr = require('./lib/logger').logErr;

const users = require('./users').users;

if (process.env.NODE_ENV == 'dev') {
  const server = require('./tests/www');
  server.listen(process.env.PORT || 8080);
  flatChecker.initOutput = true;
}



//starts the app
startCron('0 */5 8-19 * * 1-5');





async function startCrawl(callback) {
  const crawler = new Crawler();
  let flats = await crawler.crawl();
  let newFlats = await flatChecker.compare(flats);

  if (newFlats.length > 0) {
    for (let user of users) {
      user.alert(newFlats);
    }
  }

  //to wait till crawl is finished
  if (process.env.NODE_ENV == 'dev') {
    return callback();
  }

}

function startCron(cronTime) {
  if (process.env.NODE_ENV == 'dev') {
    setTimeout(() => {
      startCrawl(() => {
        startCron();
      }).catch((err) => {
        logErr(err);
      });
    }, 1000);
  } else {
    const job = new CronJob(cronTime, () => {
      startCrawl();
    }, null, null, "Europe/Amsterdam");
    job.start();
  }
}