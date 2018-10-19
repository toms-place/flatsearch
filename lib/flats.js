const myAuth = require('../auth');
const auth = myAuth.auth;
const sendNotifcationTo = myAuth.sendNotifcationTo;
const nodemailer = require('nodemailer');

class Flats {
  constructor() {
    this.flats = {};
    this.tempFlats = {};
    this.changedFlats = {};
  }
  compare() {
    var self = this;

    //clear changedFlats on init
    self.changedFlats = {};

    let flag = false;
    for (var p in self.flats) {
      //Check property exists on both objects
      if (self.flats.hasOwnProperty(p) !== self.tempFlats.hasOwnProperty(p)) {
  
        switch (typeof (self.flats[p])) {
          //Deep compare objects
          case 'object':
            if (self.flats[p].amount > self.tempFlats[p].amount && self.flats[p].id == self.tempFlats[p][t].id) {
              self.changedFlats[p] = self.flats[p];
            }
            break;
            //Compare values
          default:
            if (self.flats[p] != self.tempFlats[p]) return;
        }
      } else {
        flag = true
      }
      if (flag == true) {
        //Check object 2 for any extra properties
        for (var p in self.tempFlats) {
          if (typeof (self.flats[p]) == 'undefined') {
            self.changedFlats[p] = self.tempFlats[p];
          }
        }
      }
    }
    self.tempFlats = JSON.parse(JSON.stringify(self.flats));
    self.alert();
  }

  //TODO implement email notification
  alert() {
    if (Object.keys(this.changedFlats).length > 0) {
      console.log('new');
      /*
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: auth
      });

      let mailOptions = {
        from: auth.user,
        to: sendNotifcationTo,
        subject: `Neue Wohnung gefunden!`,
        html: getHtml(this.changedFlats)
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          for (let a of info.accepted) {
            console.log(`Email sent to: ${a}`);
          }
        }
      });*/
    } else {
      console.log("no new");
    }
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

module.exports = Flats;