const auth = require('../auth').auth;
const nodemailer = require('nodemailer');
const Flat = require('./flat');

class User {
  constructor(name, email, filter) {
    this.name = name;
    this.email = email;
    this.filter = filter;
  }
  alert(flats) {
    console.log('startAlert')

    let sendingFlats = [];
    for (let item of flats) {
      let flat = JSON.parse(item);
      if (this.filter.includes(flat.district)) {
        sendingFlats.push(flat);
      }
    }

    if (sendingFlats.length == 0) {
      return;
    } else {
      this.sendMail(sendingFlats);
      //console.log(buildHTML(sendingFlats));
    }
  }

  async sendMail(arr) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: auth
    });

    let mailOptions = {
      from: auth.user,
      to: this.email,
      subject: `Hi ${this.name}, eine neue Wohnung wurde gefunden!`,
      html: await buildHTML(arr)
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
module.exports = User;


function buildHTML(arr) {
  let html = `<body><div style="max-width: 700px; margin: auto auto;"><h1 style="color: #111;">Neue Wohnungen:</h1>`;

  for (let f of arr) {
    let flat = new Flat(f.website, f.district, f.city, f.adress, f.link, f.rooms, f.size, f.costs, f.deposit, f.funds, f.legalform, f.title, f.status, f.info, f.docs, f.images);

    html += flat.getHTML() + '<br />';

  }

  html += `<p style="color: #111;">Danke, dass du <i><strong>flatsearch</strong></i> benutzt!</p>` +
    `<p style="color: #111;">Ich bitte um Feedback an <a href="mailto:kontakt@weber-thomas.at">Thomas Weber</a>!</p>` +
    `</div></body>`;

  return html;
};