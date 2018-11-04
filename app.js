const Crawler = require('./lib/crawler');
const CronJob = require('cron').CronJob;
const FlatChecker = require('./lib/flatchecker');
const User = require('./lib/user');
const flatChecker = new FlatChecker(true);
const logErr = require('./lib/logger').logErr;

if (process.env.NODE_ENV == 'dev') {
  const server = require('./tests/www');
  server.listen(process.env.PORT || 8080);
  flatChecker.initOutput = true;
}


const name = 'Thomas';
const email = 'kontakt@weber-thomas.at';
const filter = [1020, 1030, 1200, 1210, 1220];

const thomas = new User(name, email);
const thomas2 = new User('Thomas2', 'thomas.weber96@gmail.com', [3950]);

var users = [thomas];



let cronTime = '0 */1 8-21 * * *';
startCron(cronTime);





async function startCrawl(callback) {
  const crawler = new Crawler();
  await crawler.crawl();
  let newFlats = await flatChecker.compare(crawler.flats);

  if (newFlats.length > 0) {
    for (let user of users) {
      user.alert(newFlats);
    }
  }

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
    }, 10000);
  } else {
    const job = new CronJob(cronTime, () => {
      startCrawl();
    }, null, null, "Europe/Amsterdam");
    job.start();
  }
}