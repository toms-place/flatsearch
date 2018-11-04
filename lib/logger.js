exports.logErr = function(err) {
  if (err.name == 'RequestError') {
    console.log(err.name, err.message);
  } else {
    console.log(err);
  }
}