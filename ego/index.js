const Logger = require('../utils/logger');
const middlewares = require('./middlewares');
const { connectorManager } = require('../connector');
const { contextManager } = require('../context');

class Ego {
  id = 'exaego';
  logger;

  constructor() {
    connectorManager.getConnectors.forEach(connector => {
      connector.on('message', message =>
        this.eval(message, connector));
    });
    contextManager.createContext('persistent', {
      id: this.id,
      initialValue: {
        aliases: {},
        triggers: {},
      },
    });
    this.logger = new Logger('EGO');
  }

  eval(message, connector) {
    contextManager.createContext()
      .then(localContext => {
        localContext.egoId = this.id;
        localContext.connectorId = connector.id;
        for(let middleware of middlewares) {
          if (!middleware(message, localContext)) {
            break;
          }
        }
      })
      .catch(this.logger.error);
  }
}

module.exports = Ego;
