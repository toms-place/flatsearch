const dbUser = require('../model/user');
const Flat = require('../model/flat');
const getJustUniqueFlatsFromArray2 = require('./getJustUniqueFlatsFromArray2');

class UserFlatChecker {
  constructor() {
  }
  saveNewFlats(newFlats) {
    let self = this;

    if (newFlats.length > 0) {
      try {
        dbUser.find({}).exec(function (err, users) {
          if (!err) {

            for (let user of users) {

              let userTempFlats = [];
              let tempNewFlats = self.getMatchingFlats(newFlats, user);

              for (let flatJSON of user.flats) {
                let flat = new Flat()
                Object.assign(flat, flatJSON);
                userTempFlats.push(flat);
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
    } else {
      return;
    }
  }

  getMatchingFlats(newFlats, user) {
    if (newFlats.length > 0) {
      let tempNewFlats = [];

      /* New Flats are pushed to each user if plz_interests, costs and size match */
      for (let flat of newFlats) {
        if (user.plz_interests.includes(flat.district)) {
          if (!isNaN(parseFloat(flat.costs)) && !isNaN(parseFloat(flat.size))) {
            if (flat.costs <= user.max_costs && (flat.size >= user.min_size && flat.size <= user.max_size)) {
              tempNewFlats.push(flat);
            }
          } else if (!isNaN(parseFloat(flat.costs))) {
            if (flat.costs <= user.max_costs) {
              tempNewFlats.push(flat);
            }
          } else if (!isNaN(parseFloat(flat.size))) {
            if (flat.size >= user.min_size && flat.size <= user.max_size) {
              tempNewFlats.push(flat);
            }
          } else {
            tempNewFlats.push(flat);
          }
        }
      }
      return tempNewFlats;
    } else {
      return;
    }
  }
}

module.exports = UserFlatChecker;