const Filereader = require('./Filereader');
const nodemailer = require('nodemailer');
const dbUser = require('../model/user');
const logOut = require('./logger').logOut;
const logErr = require('./logger').logErr;
const CronJob = require('cron').CronJob;
const Flat = require('../model/flat');
const moment = require('moment-timezone');
const constants = require('../config/constants');

class Notifier {
  startCron(cron) {
    const job = new CronJob(cron, async () => {
      await this.alert();
    }, null, null, "Europe/Amsterdam");
    job.start();
  }

  async alert() {

    let current_hour = moment().tz("Europe/Amsterdam").format('H');
    let current_day = moment().tz("Europe/Amsterdam").weekday();
    let current_minute = moment().tz("Europe/Amsterdam").get('minute');

    let users = await dbUser.find({});
    for (let user of users) {

      if (user.flats.length > 0) {
        let sendFlag = false;

        switch (user.notificationrate) {
          case 1:
            sendFlag = true;
            break;
          case 2:
            if ((current_minute == 0 || current_minute == 1) && (current_hour == 6 || current_hour == 12 || current_hour == 18)) {
              sendFlag = true;
            }
            break;
          case 3:
            if ((current_minute == 0 || current_minute == 1) && (current_hour == 10 || current_hour == 15)) {
              sendFlag = true;
            }
            break;
          case 4:
            if ((current_minute == 0 || current_minute == 1) && current_hour == 6) {
              sendFlag = true;
            }
            break;
          case 5:
            if ((current_minute == 0 || current_minute == 1) && current_day == 4 && current_hour == 8) {
              sendFlag = true;
            }
            break;
          default:
            sendFlag = false;
            break;
        }

        try {

          if (sendFlag == true) {

            let sendingFlats = [];
            for (let flatJSON of user.flats) {
              let flat = new Flat(flatJSON.website, flatJSON.district, flatJSON.city, flatJSON.address, flatJSON.link, flatJSON.rooms, flatJSON.size, flatJSON.costs, flatJSON.deposit, flatJSON.funds, flatJSON.legalform, flatJSON.title, flatJSON.status, flatJSON.info, flatJSON.docs, flatJSON.images);
              if (user.plz_interests.includes(flat.district)) {
                sendingFlats.push(flat);
              }
            }

            if (sendingFlats.length > 0) {
              await sendMail(sendingFlats, user);
              await dbUser.updateOne({
                'mail': user.mail
              }, {
                'flats': []
              });

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

  let mailAuth;
  let data;

  try {
    data = await Filereader.readFile(process.env.NODE_PATH + '/config/mailAuth.json');
  } catch (error) {
    if (error) throw error
  }

  mailAuth = JSON.parse(data);

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

  let html = buildHTML(sendingFlats, user);

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


function buildHTML(flats, user) {
  let html = `
  <!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>Flatsearch</title>
      <link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans" rel="stylesheet">
      <style type="text/css">

      /* -------------------------------------
          GLOBAL
      ------------------------------------- */
      * {
        font-family: 'IBM Plex Sans', sans-serif;
        margin: 0;
        padding: 0;
      }
    
      img {
        max-width: 600px;
        width: auto;
      }

      /* -------------------------------------
          ELEMENTS
      ------------------------------------- */
      
      /* -------------------------------------
      TYPOGRAPHY
      ------------------------------------- */
        h1, 
        h2, 
        h3 {
          color: #111111;
          font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
          font-weight: 200;
          line-height: 1.2em;
          margin: 10px 0 5px;
        }

        h1 {
          font-size: 32px;
        }
        h2 {
          font-size: 28px;
        }
        h3 {
          font-size: 22px;
        }
        h4 {
          font-size: 20px;
          color: #111111;
          font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
          font-weight: 200;
          line-height: 1.2em;
          margin: 10px 0 5px;
        }

        p,
        ul,
        ol {
          font-size: 14px;
          font-weight: normal;
          margin-bottom: 10px;
        }

        ul li,
        ol li {
          margin-left: 5px;
          list-style-position: inside;
        }

      /* -------------------------------------
          BODY
      ------------------------------------- */
    
      body {
        -webkit-font-smoothing: antialiased;
        height: 100%;
        -webkit-text-size-adjust: none;
        width: 100% !important;
        -ms-text-size-adjust: 100%;
        text-align: left;
      }

      table.body {
        margin: auto auto;
      }

      table.body-wrap {
        width: 100%;
      }

      /* -------------------------------------
          FOOTER
      ------------------------------------- */
      table.footer-wrap {
        clear: both !important;
        width:100% !important;
        padding: 10px;
      }
    
      .footer-wrap .container p {
        color: #111;
        font-size: 12px;
      }
    
      table.footer-wrap a {
        color: #333;
      }

      </style>
      </head>

      <body>
        <!-- body -->
        <table class="body">
          <tr>

          <!-- spacing -->
          <td>
          </td>
          <!-- /spacing -->

          <td>
          <!-- header -->
            <table width="100%" class="footer-wrap" bgcolor="#aaa">
              <tr>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

                <td>
                  <div class="header">
                    <h1>
                      Flatsearch
                    </h1>
                  </div>
                </td>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

              </tr>
            </table>
            <!-- /header -->

            <!-- body-wrap -->
            <table class="body-wrap" width="100%" >
              <tr class="flats">

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

                <td class="container">
                  <!-- content -->
                  <div class="content">
                  <table>
                    <tr>
                      <td>`;

                        for (let flat of flats) {
                          //todo flat
                          html += flat.getHTML();
                        }

                        html += `
                      </td>
                    </tr>
                  </table>
                  </div>
                  <!-- /content -->
                </td>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

              </tr>
            </table>
            <!-- /body-wrap -->

            <!-- footer -->
            <table  width="100%" class="footer-wrap" bgcolor="#aaa">
              <tr>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

                <td class="container">
                  
                  <!-- content -->
                  <div class="content">
                    <table>
                      <tr>
                        <td>
                          <p>
                            Danke, dass du <i><strong>flatsearch</strong></i> benutzt!
                          </p>
                          <p>
                            Feedback an <a href="mailto:flatsearch@weber-thomas.at">flatsearch@weber-thomas.at</a>.
                          </p>
                          <h4>Credits:</h4>
                          <p><a href="https://icons8.com">Icon pack by Icons8</a><p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!-- /content -->
                  
                </td>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

              </tr>
            </table>
            <!-- /footer -->

            <!-- bottom-bar -->
            <table width="100%" class="footer-wrap" bgcolor="#888">
              <tr>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

                <td class="container">
                  
                  <!-- content -->
                  <div class="content">
                    <table>
                      <tr>
                        <td>
                          <p>Don't like these annoying emails?<br />
                            Delete your account: <a href="` + constants.webHost + `/delete_on_activation/?email=` + user.mail + `&active_link=` + user.active_hash + `"><unsubscribe>Delete me now</unsubscribe></a>!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!-- /content -->
                  
                </td>

                <!-- spacing -->
                <td>
                </td>
                <!-- /spacing -->

              </tr>
            </table>
            <!-- /bottom-bar -->
          </td>

          <!-- spacing -->
          <td>
          </td>
          <!-- /spacing -->

          </tr>
        </table>
      </body>
    </html>`;

  return html;
};