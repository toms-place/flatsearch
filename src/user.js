const fs = require('fs');
const nodemailer = require('nodemailer');
const Flat = require('./flat');
const logOut = require('./logger').logOut;
const logErr = require('./logger').logErr;
const CronJob = require('cron').CronJob;

class User {
  constructor(name, email, filter, notificationRate) {
    this.name = name;
    this.email = email;
    this.filter = filter;
    this.notificationRate = notificationRate;
    this.flats = [];
  }

  addFlat(flat) {
    this.flats.push(flat);
  }

  notify() {
    const job = new CronJob('0 */10 * * * *', () => {
      this.alert(this.flats);
    }, null, null, "Europe/Amsterdam", null, true);
    job.start();
  }

  alert(flats) {
    let sendingFlats = [];
    for (let item of flats) {
      let flat = JSON.parse(item);
      if (this.filter) {
        if (this.filter.includes(flat.district)) {
          sendingFlats.push(flat);
        }
      } else {
        sendingFlats.push(flat);
      }
    }

    if (sendingFlats.length == 0) {
      return;
    } else {
      this.sendMail(sendingFlats);
      this.flats = [];
    }
  }

  async sendMail(arr) {
    fs.readFile('./mailAuth.json', async (err, data) => {
      if (err) throw err;

      let mailAuth = JSON.parse(data);

      let transporter = nodemailer.createTransport({
        host: mailAuth.host,
        service: mailAuth.service,
        port: 465,
        secure: true, // use SSL
        auth: {
          user: mailAuth.user,
          pass: mailAuth.pass
        }
      });

      let subject = `Hi ${this.name}, eine neue Wohnung wurde gefunden!`;

      if (process.env.NODE_ENV == 'dev') {
        subject = `TEST: Hi ${this.name}, eine neue Wohnung wurde gefunden!`;
      }

      let html = buildHTML(arr);

      let mailOptions = {
        from: mailAuth.user,
        to: this.email,
        subject: subject,
        html: html
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          logErr(error);
        } else {
          for (let a of info.accepted) {
            logOut(`Email sent to: ${a}`);
          }
        }
      });

      fs.writeFile('./messageTest.html', html, (err) => {
        if (err) throw err;
      });

    });
  }
}
module.exports = User;


function buildHTML(arr) {
  let html = `
  <!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>Flatsearch</title>
      <link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans" rel="stylesheet">
      <style type="text/css">

      </style>
      </head>

      <body style="font-family: 'IBM Plex Sans', sans-serif; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;">
        <div style="max-width: 800px; margin: auto auto; padding: 0px 20px;">
          <h1 style="color: #111;">Neue Wohnungen:</h1>`;

  for (let f of arr) {
    let flat = new Flat(f.website, f.district, f.city, f.address, f.link, f.rooms, f.size, f.costs, f.deposit, f.funds, f.legalform, f.title, f.status, f.info, f.docs, f.images);

    html += flat.getHTML() + '<br /><br /><br />';

  }

  html += `
          <p style="color: #111;">
            Danke, dass du <i><strong>flatsearch</strong></i> benutzt!<br />
            Ich bitte um Feedback an <a href="mailto:kontakt@weber-thomas.at">Thomas Weber</a>!
          </p>
          <h4>Credits:</h4>
          <a href="https://icons8.com">Icon pack by Icons8</a>
        </div>
      </body>
    </html>`;

  return html;
};