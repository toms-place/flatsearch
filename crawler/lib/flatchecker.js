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
              let userTempNewFlats = [];
                  
              for (let flatJSON of user.flats) {
                let flat = new Flat(flatJSON.website, flatJSON.district, flatJSON.city, flatJSON.address, flatJSON.link, flatJSON.rooms, flatJSON.size, flatJSON.costs, flatJSON.deposit, flatJSON.funds, flatJSON.legalform, flatJSON.title, flatJSON.status, flatJSON.info, flatJSON.docs, flatJSON.images);
                if (user.plz_interests.includes(flat.district)) {
                  userTempFlats.push(flat);
                }
              }

              for (let flat of newFlats) {
                if (user.plz_interests.includes(flat.district)) {
                  userTempNewFlats.push(flat);
                }
              }

              let flatsToSave = getJustUniqueFlatsFromArray2(userTempFlats, userTempNewFlats);

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