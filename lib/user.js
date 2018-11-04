const myAuth = require('../auth');
const auth = myAuth.auth;
const sendNotifcationTo = myAuth.sendNotifcationTo;
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
      sendMail(sendingFlats);
      //console.log(buildHTML(sendingFlats));
    }
  }
}
module.exports = User;


async function sendMail(arr) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  });

  let mailOptions = {
    from: auth.user,
    to: sendNotifcationTo,
    subject: `Neue Wohnung gefunden!`,
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


function buildHTML(arr) {
  let html = `<body><h1 style="color: #111;">Neue Wohnungen:</h1>`;

  for (let f of arr) {
    let flat = new Flat(f.district, f.city, f.adress, f.link, f.rooms, f.size, f.costs, f.deposit, f.funds, f.legalform, f.title, f.status, f.info, f.docs, f.images);

    html += flat.getHTML() + '<br />';

  }

  html += `<p style="color: #111;">Danke, dass du flatsearch benutzt!</p>` +
  `<p style="color: #111;">Ich bitte um Feedback an <a href="mailto:kontakt@weber-thomas.at">Thomas Weber</a>!</p>` +
  `</body>`;

  return html;
};