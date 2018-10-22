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

    if (Object.keys(this.tempFlats).length === 0) {
      for (let key in this.flats) {
        if (parseInt(this.flats[key].amount) > 0) {
          this.changedFlats[key] = this.flats[key];
        }
      }
    } else {
      for (let key in this.flats) {
        if (typeof (this.tempFlats[key]) == 'undefined') {
          this.changedFlats[key] = this.flats[key];
        } else if (this.tempFlats[key].amount < this.flats[key].amount) {
          this.changedFlats[key] = this.flats[key];
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
      console.log('first run over');
      this.initFlag = false;
    } else {
      let sendingObj = {};
      for (let key in this.changedFlats) {

        if (this.changedFlats[key].district > 1000 && this.changedFlats[key].district < 2000) {
          sendingObj[key] = this.changedFlats[key];
        }
      }
      if (Object.keys(sendingObj).length === 0) {
        return;
      } else {
        this.sendMail(sendingObj);
      }
    }
  }
  async sendMail(obj) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: auth
    });

    let mailOptions = {
      from: auth.user,
      to: sendNotifcationTo,
      subject: `Neue Wohnung gefunden!`,
      html: await getHtml(obj)
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