const Logger = require('../utils/logger');
const middlewares = require('./middlewares');
const { createContext } = require('../utils/context');

class Ego {
  static id = 'exaego';
  connectors;
  context;
  logger;

  constructor(connectors) {
    this.connectors = connectors;
    createContext('persistent', {
      id: Ego.id,
      initialValue: {
        aliases: {},
        triggers: {},
      },
    })
      .then(context => {
        this.context = context;
      });
    this.logger = new Logger('EGO');
    connectors.forEach(connector => {
      connector.on('message', (message, connectorContext) =>
        this.eval(message, connector, connectorContext, this.context));
    });
  }

  eval(message, connector, connectorContext, globalContext) {
    createContext()
      .then(localContext => {
        for(let middleware of middlewares) {
          if (!middleware(message, connector, localContext, connectorContext, globalContext)) {
            break;
          }
        }
      })
      .catch(this.logger.error);
  }
}

module.exports = Ego;
