const getJustUniqueFlatsFromArray2 = require('./getJustUniqueFlatsFromArray2');
const UFC = require('./userflatchecker');
const UserFlatChecker = new UFC();

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
      //saves just flats with the correct filter
      UserFlatChecker.saveNewFlats(newFlats);
    }

    //set tempFlats to just crawled flats
    this.tempFlats = flats;

  }
};

module.exports = FlatChecker;