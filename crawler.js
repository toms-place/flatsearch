var myAuth = require('./auth');
var auth = myAuth.auth;
var sendNotifcationTo = myAuth.sendNotifcationTo;
var nodemailer = require('nodemailer');
var CronJob = require('cron').CronJob;

class Crawler {
  constructor(url, cronTime, initOut) {
    this.url = url
    this.cronTime = cronTime
    this.initOut = initOut || false
    this.flats = []
    this.tempFlats = []
    this.changedFlats = []
  }
  crawl() {}
  startCrawl() {
    var self = this;

    /*
        //timout for testing
        setTimeout(() => {
          console.log('job started! repeating in ' + self.cronTime + ' milliseconds');
          self.crawl().then(() => {
            self.compare(() => {
              self.alert();
            });
          });
          self.startCrawl();
        }, self.cronTime);
      */

    //don't forget the *&/ for the cronjob per minute
    const job = new CronJob('0 */' + self.cronTime + ' 9-20 * * *', function () {
      console.log('Every ' + self.cronTime + ' minutes');
      self.crawl().then(() => {
        self.compare();
        self.alert("email");
      });
    });
    job.addCallback();
    job.start();
    return job;


  }
  //TODO implement email notification
  alert() {
    if (this.changedFlats.length > 0) {
      sendNotification(getHtml(this.changedFlats), this);
    }
  }
  compare(callback) {
    var self = this;

    //clear changedFlats on init
    self.changedFlats = [];
    var tempIDs = [];
    var newFlats = {};

    //first push of all available flats if flag is set true
    if (self.tempFlats.length == 0 && self.initOut == true) {
      for (let i = 0; i < self.flats.length; i++) {
        if (parseInt(self.flats[i].amount) > 0) {
          self.changedFlats.push(self.flats[i]);
        }
      }
    } else {
      //store all temp to compare against
      for (let t in self.tempFlats) {
        tempIDs.push(self.tempFlats[t].id);
      }
      //compare all tempFlats against all just crawled flats
      for (let f in self.flats) {
        for (let t in self.tempFlats) {
          if (self.flats[f].id == self.tempFlats[t].id && (self.flats[f].amount > self.tempFlats[t].amount)) {
            self.changedFlats.push(self.flats[f]);
          } else {
            //check for crawled flats not in tempFlats array
            if ((tempIDs.indexOf(self.flats[f].id) < 0)) {
              newFlats[self.flats[f].id] = true;
            }
          }
        }
      }
      //add all crawled flats which are new
      for (let f of self.flats) {
        for (let nF in newFlats) {
          if (f.id == nF) {
            self.changedFlats.push(f);
          }
        }
      }
    }

    self.tempFlats = Array.from(self.flats);
    callback();

  }
}

function getHtml(arr) {
  let html = '<h1>Neue Wohnungen:</h1>';

  for (let i of arr) {
    let title;
    if (i.title) title = i.title;
    else title = i.address;
    html +=
      `<h2><a href='${i.link}'>${title}</a></h2>` +
      `<p>${i.amount} Wohnung/en<br />` +
      `in ${i.district} ${i.city}, ${i.address}<p><br />`
  }

  return html;
};

function sendNotification(html, self) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  });

  for (var i = 0; i < sendNotifcationTo.length; i++) {

    var mailOptions = {
      from: auth.user,
      to: sendNotifcationTo[i],
      subject: `${self.url} - neue Wohnung gefunden!`,
      html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

}

module.exports = Crawler;