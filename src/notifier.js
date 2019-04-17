const Filereader = require('./Filereader');
const nodemailer = require('nodemailer');
const dbUser = require('./model/user');
const logOut = require('./logger').logOut;
const logErr = require('./logger').logErr;
const CronJob = require('cron').CronJob;
const Flat = require('./model/flat');

class Notifier {
  startCron(cron) {
    const job = new CronJob(cron, async () => {
      await this.alert();
    }, null, null, "Europe/Amsterdam");
    job.start();
  }

  async alert() {

    let date = new Date();
    let current_hour = date.getHours();
    let current_day = date.getDay();
    let current_minute = date.getMinutes();

    let users = await dbUser.find({});
    for (let user of users) {

      if (user.flats.length > 0) {
        let sendFlag = false;

        switch (user.notificationrate) {
          case 1:
          case 2 && current_minute == 0 && (current_hour == 6 || current_hour == 12 || current_hour == 18):
          case 3 && current_minute == 0 && (current_hour == 10 || current_hour == 15):
          case 4 && current_minute == 0 && current_hour == 6:
          case 5 && current_minute == 0 && current_day == 3:
            sendFlag = true;
            break;
          default:
            sendFlag = false;
            break;
        }

        try {

          if (sendFlag == true) {
            console.log(user.mail);
            console.log("first indicator");

            let sendingFlats = [];
            for (let flatJSON of user.flats) {
              let flat = new Flat(flatJSON.website, flatJSON.district, flatJSON.city, flatJSON.address, flatJSON.link, flatJSON.rooms, flatJSON.size, flatJSON.costs, flatJSON.deposit, flatJSON.funds, flatJSON.legalform, flatJSON.title, flatJSON.status, flatJSON.info, flatJSON.docs, flatJSON.images);
              if (user.plz_interests.includes(flat.district)) {
                sendingFlats.push(flat);
              }
            }

            if (sendingFlats.length > 0) {
              console.log("second indicator");
              await sendMail(sendingFlats, user);
              await dbUser.updateOne({
                'mail': user.mail
              }, {
                'flats': []
              });
              console.log("third indicator");

            }
          }
        } catch (error) {
          if (error) throw error;
        }
      }
    }

  }
}
module.exports = Notifier;

async function sendMail(sendingFlats, user) {

  console.log("sendmail indicator");
  let mailAuth;
  try {
    let data = await Filereader.readFile('./mailAuth.json');
    mailAuth = JSON.parse(data);

  } catch (error) {
    if (error) throw error
  }

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

  let subject = `Hi ${user.name}, eine neue Wohnung wurde gefunden!`;

  if (process.env.NODE_ENV == 'dev') {
    subject = `TEST: Hi ${user.name}, eine neue Wohnung wurde gefunden!`;
  }

  let html = buildHTML(sendingFlats);

  let mailOptions = {
    from: mailAuth.user,
    to: user.mail,
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

}


function buildHTML(flats) {
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

  for (let flat of flats) {
    //todo flat
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