class FlatChecker {
  constructor(initOutput) {
    this.initOutput = false || initOutput;
    this.tempFlats = [];
  }
  compare(flats) {
    //console.log('startCompare');
    //clear changedFlats on init
    let newFlats = [];

    if (this.tempFlats.length == 0 && this.initOutput) {
      for (let i = 0; i < flats.length; i++) {
        newFlats.push(flats[i]);
      }
    } else if (this.tempFlats.length !== 0) {

      let l;
      if (flats.length >= this.tempFlats.length) {
        l = flats.length;
      } else {
        l = this.tempFlats.length;
      }

      for (let i = 0; i < l; i++) {
        if ( !this.tempFlats.includes(flats[i]) && flats[i] !== undefined ) {
          //console.log('new flat', JSON.parse(flats[i]));
          newFlats.push(flats[i]);
        }
      }
    }

    //set tempFlats to just crawled flats
    this.tempFlats = flats;

    return newFlats;
  }
};

module.exports = FlatChecker;