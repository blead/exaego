const Logger = require('../utils/logger');
const middlewares = require('./middlewares');

class Ego {
  connectors;
  context = {
    triggers: {},
  };
  logger;

  constructor(connectors) {
    this.connectors = connectors;
    this.logger = new Logger('EGO');
    connectors.forEach(connector => {
      connector.on('message', (message, connectorContext) =>
        this.eval(message, connector, connectorContext, this.context));
    });
  }

  eval(message, connector, connectorContext, globalContext) {
    const localContext = {};
    try {
      for(let middleware of middlewares) {
        if (!middleware(message, connector, localContext, connectorContext, globalContext)) {
          break;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}

module.exports = Ego;
