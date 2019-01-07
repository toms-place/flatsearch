const flatEmitter = require('./flatEmitter');

flatEmitter.on('newFlat', function (flats, users) {
  for (let user of users) {
    for (let flat of flats) {
      user.addFlat(flat);
    }
  }
});

module.exports = flatEmitter;