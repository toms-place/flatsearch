const fs = require('fs');
const CronJob = require('cron').CronJob;

const Crawler = require('./src/crawler');
const logErr = require('./src/logger').logErr;
const User = require('./src/user');
const server = require('./tests/www.js');

const crawler = new Crawler();

if (process.env.NODE_ENV == 'dev') {
  //server.listen(8080);
}

//starts the app
startCron('0 */5 * * * *');





async function startCrawl(callback) {
  let users = [];

  fs.readFile('./users.json', async (err, data) => {
    if (err) throw err;
    let usersJSON = JSON.parse(data);

    for (let key in usersJSON) {
      let user = new User(usersJSON[key].name, usersJSON[key].email, usersJSON[key].filter);
      users.push(user);
    }

    let newFlats = await crawler.crawl();


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
    }, 10000);
  } else {
    const job = new CronJob(cronTime, () => {
      startCrawl().catch((err) => {
        logErr(err);
      });
    }, null, null, "Europe/Amsterdam");
    job.start();
  }
}