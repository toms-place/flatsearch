const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  switch (req.url) {
    case '/neuesleben':
      fs.readFile('./tests/neuesleben.html', (err, data) => {
        if (err) throw err;
        res.write(data);
        res.end();
      });
      break;
    case '/ebg':
      fs.readFile('./tests/ebg.html', (err, data) => {
        if (err) throw err;
        res.write(data);
        res.end();
      });
      break;
    default:
      break;
  }
});

module.exports = server;