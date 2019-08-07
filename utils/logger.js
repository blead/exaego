class Logger {
  prefix;
  constructor(prefix) {
    this.prefix = prefix;
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
  }
  log(message) {
    console.log(`${new Date().toISOString()} ${this.prefix} ${message}`);
  }
  error(message) {
    console.error(`${new Date().toISOString()} ${this.prefix} ${message}`);
  }
}

module.exports = Logger;
