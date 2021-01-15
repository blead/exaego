const util = require('util');

class Logger {
  prefix;
  constructor(prefix) {
    this.prefix = prefix;
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
  }
  log(message) {
    if (typeof message === 'object') {
      message = util.inspect(message);
    }
    console.log(`${new Date().toISOString()} ${this.prefix} ${message}`);
  }
  error(message) {
    if (typeof message === 'object') {
      message = util.inspect(message);
    }
    console.error(`${new Date().toISOString()} ${this.prefix} ${message}`);
  }
}

module.exports = Logger;
