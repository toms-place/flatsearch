const fs = require('fs');
const nodemailer = require('nodemailer');
const Flat = require('./flat');
const logOut = require('./logger').logOut;
const logErr = require('./logger').logErr;

class User {
  constructor(name, email, filter) {
    this.name = name;
    this.email = email;
    this.filter = filter;
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

      let mailOptions = {
        from: mailAuth.user,
        to: this.email,
        subject: subject,
        html: buildHTML(arr)
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
      </head>

      <body>
        <div style="max-width: 800px; margin: auto auto;">
        <h1 style="color: #111;">Neue Wohnungen:</h1>`;

          for (let f of arr) {
            let flat = new Flat(f.website, f.district, f.city, f.adress, f.link, f.rooms, f.size, f.costs, f.deposit, f.funds, f.legalform, f.title, f.status, f.info, f.docs, f.images);

            html += flat.getHTML() + '<br />';

          }

            html += `
        <p style="color: #111;">Danke, dass du <i><strong>flatsearch</strong></i> benutzt!</p>
        <p style="color: #111;">Ich bitte um Feedback an <a href="mailto:kontakt@weber-thomas.at">Thomas Weber</a>!</p>
      </body>
    </html>`;

  return html;
};