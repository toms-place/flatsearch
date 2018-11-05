const fs = require('fs');
const CronJob = require('cron').CronJob;

const Crawler = require('./lib/crawler');
const FlatChecker = require('./lib/flatchecker');
const logErr = require('./lib/logger').logErr;
const User = require('./lib/user');
const flatChecker = new FlatChecker();

if (process.env.NODE_ENV == 'dev') {
  const server = require('./tests/www');
  server.listen(process.env.PORT || 8080);
  flatChecker.initOutput = true;
}



//starts the app
startCron('0 */5 8-19 * * 1-5');





async function startCrawl(callback) {
  const crawler = new Crawler();
  const users = [];

  fs.readFile('./users.json', async (err, data) => {
    if (err) throw err;

    let usersJSON = JSON.parse(data);

    for (let key in usersJSON) {
      let user = new User(usersJSON[key].name, usersJSON[key].email, usersJSON[key].filter);
      users.push(user);
    }

    let flats = await crawler.crawl();
    let newFlats = await flatChecker.compare(flats);

    if (newFlats.length > 0) {
      for (let user of users) {
        user.alert(newFlats);
      }
    }

    //wait till crawl is finished
    if (process.env.NODE_ENV == 'dev') {
      callback();
    }

  });
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
      startCrawl().catch((err) => {
        logErr(err);
      });
    }, null, null, "Europe/Amsterdam");
    job.start();
  }
}