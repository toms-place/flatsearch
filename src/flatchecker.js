const dbUser = require('./model/user');

class FlatChecker {
  constructor(initOutput) {
    this.initOutput = false || initOutput;
    this.tempFlats = [];
  }
  compare(flats) {
    let newFlats = [];

    /* Checks which array is longer */
    let longerFlatArray;
    if (flats.length >= this.tempFlats.length) {
      longerFlatArray = flats.length;
    } else {
      longerFlatArray = this.tempFlats.length;
    }

    if (this.initOutput) {

      for (let i = 0; i < longerFlatArray; i++) {
        newFlats.push(flats[i]);
      }

      this.initOutput = false;

    } else {

      /* this is the actual testing part */
      for (let i = 0; i < longerFlatArray; i++) {
        for (let y = 0; y < this.tempFlats.length; y++) {
          let sameFlat = flats[i].isSameAs(this.tempFlats[y]);
          if (!sameFlat && flats[i] !== undefined) {
            newFlats.push(flats[i]);
          }
        }
      }

    }

    /* New Flats are pushed to each user if plz_interests match*/
    if (newFlats.length > 0 || (this.initOutput == true && newFlats.length > 0)) {
      try {
        dbUser.find({}).exec(function (err, users) {
          if (!err) {

            for (let user of users) {
              let flag = false;

              for (let flat of newFlats) {
                if (user.plz_interests.includes(flat.district)) {
                  user.flats.push(flat);
                  flag = true;
                }
              }

              if (flag) {
                console.log("saving");
                user.save(function (err) {
                  if (err) throw err;
                });
              }
              
            }

          }
        })
      } catch (err) {
        throw err;
      }
    }

    //set tempFlats to just crawled flats
    this.tempFlats = flats;

  }
};

module.exports = FlatChecker;