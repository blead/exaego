const http = require('http');
const config = require('./config');
const connectors = require('./connectors');
const Ego = require('./ego');
const Logger = require('./utils/logger');

const ego = new Ego(connectors.map(Connector => new Connector(config[Connector.id])));

const webLogger = new Logger('WEB');

const web = http.createServer((request,response) => {
  const message = 'Redirecting to GitHub!';
  response.writeHead(301, {
    'Location' : 'https://github.com/blead/exaego',
    'Content-Length' : message.length,
    'Content-Type' : 'text/plain',
  });
  response.end(message);
});

web.listen(config.web.port, config.web.ip, () => {
  webLogger.log(`web server listening on ${config.web.ip}:${config.web.port}`);
});
