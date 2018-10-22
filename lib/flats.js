const myAuth = require('../auth');
const auth = myAuth.auth;
const sendNotifcationTo = myAuth.sendNotifcationTo;
const nodemailer = require('nodemailer');

class Flats {
  constructor() {
    this.flats = {};
    this.tempFlats = {};
    this.changedFlats = {};
    this.initFlag = true;
  }
  compare() {
    //clear changedFlats on init
    this.changedFlats = {};

    if (Object.keys(this.tempFlats).length === 0 && process.env.NODE_ENV == 'dev') {
      for (var p in this.flats) {
        if (parseInt(this.flats[p].amount) > 0) {
          this.changedFlats[p] = this.flats[p];
        }
      }
    } else {
      for (var p in this.flats) {
        if (typeof (this.tempFlats[p]) == 'undefined') {
          this.changedFlats[p] = this.flats[p];
          continue;
        }
        if (this.flats[p].amount > this.tempFlats[p].amount) {
          this.changedFlats[p] = this.flats[p];
        }
      }
    }
    //set tempFlats to just crawled flats
    this.tempFlats = JSON.parse(JSON.stringify(this.flats));
    this.alert();
  }

  //TODO implement email notification
  alert() {
    if (Object.keys(this.changedFlats).length === 0) {
      //console.log('no new');
    } else if (this.initFlag == true) {
      this.initFlag = false;
    } else {
      let sendingObj = {};
      for (let obj in this.changedFlats) {

        if (this.changedFlats[obj].district > 1000 && this.changedFlats[obj].district < 2000) {
          sendingObj[obj] = this.changedFlats[obj];
        }
      }
      this.sendMail(sendingObj);
    }
  }
  sendMail(obj) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: auth
    });

    let mailOptions = {
      from: auth.user,
      to: sendNotifcationTo,
      subject: `Neue Wohnung gefunden!`,
      html: getHtml(obj)
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        for (let a of info.accepted) {
          console.log(`Email sent to: ${a}`);
        }
      }
    });
  }
}

function getHtml(obj) {
  let html = '<h1>Neue Wohnungen:</h1>';

  for (let key in obj) {
    let title = key;

    html +=
      `<h2><a href='${obj[key].link}'>${obj[key].district}, ${title}</a></h2>` +
      `<ul><li>${obj[key].rooms} Zimmer</li>` +
      `<li>Status: ${obj[key].status}</li>` +
      `<li>Miete: ${obj[key].costs}</li>` +
      `<li>Beitrag: ${obj[key].funds}</li>` +
      `</ul><br />`
  }

  return html;
};

module.exports = Flats;