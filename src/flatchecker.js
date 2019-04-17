const dbUser = require('./model/user');

class FlatChecker {
  constructor(initOutput) {
    this.initOutput = false || initOutput;
    this.tempFlats = [];
  }
  async compare(flats) {
    let newFlats = [];

    if (this.initOutput) {

      newFlats = flats;
      this.initOutput = false;

    } else {

      newFlats = getJustUniqueElementsFromArray2(this.tempFlats, flats);

    }

    /* New Flats are pushed to each user if plz_interests match*/
    if (this.initOutput == true && newFlats.length > 0) {
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
      this.initOutput = true;
    }

    //set tempFlats to just crawled flats
    this.tempFlats = flats;

  }
};

module.exports = FlatChecker;


function getJustUniqueElementsFromArray2(array1, array2) {

  let uniqueElements = [];

  /* Nested for loop starting with longer array */
  for (let elem2 of array2) {
    let found = false;

    for (let elem1 of array1) {
      if (elem2.isSameAs(elem1)) {
        found = true;
      }
    }

    if (!found) uniqueElements.push(elem2)
  }

  return uniqueElements;

}