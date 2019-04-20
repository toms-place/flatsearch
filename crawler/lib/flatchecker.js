const dbUser = require('../model/user');
const Flat = require('../model/flat');

class FlatChecker {
  constructor(initOutput) {
    this.initOutput = initOutput;
    this.tempFlats = [];
  }
  async compare(flats) {
    let newFlats = [];
    newFlats = getJustUniqueFlatsFromArray2(this.tempFlats, flats);
    if (this.initOutput == undefined) {
      this.initOutput = true;
    } else {
      saveNewFlats(newFlats);
    }

    //set tempFlats to just crawled flats
    this.tempFlats = flats;

  }
};

module.exports = FlatChecker;

function saveNewFlats(newFlats) {

    /* New Flats are pushed to each user if plz_interests match */
      try {
        dbUser.find({}).exec(function (err, users) {
          if (!err) {

            for (let user of users) {

              let userTempFlats = [];
              let tempNewFlats = [];

              for (let flatJSON of user.flats) {
                let flat = new Flat()
                Object.assign(flat, flatJSON);
                userTempFlats.push(flat);
              }

              for (let flat of newFlats) {
                if (user.plz_interests.includes(flat.district)) {
                  if (!isNaN(parseFloat(flat.costs))) {
                    if (flat.costs <= user.max_costs) {
                      tempNewFlats.push(flat);
                    }
                  } else {
                    tempNewFlats.push(flat);
                  }
                }
              }

              let flatsToSave = getJustUniqueFlatsFromArray2(userTempFlats, tempNewFlats);

              if (flatsToSave.length > 0) {

                for (let flat of flatsToSave) {
                  user.flats.push(flat);
                }

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


function getJustUniqueFlatsFromArray2(array1, array2) {

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