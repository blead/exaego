var Aliases = require('./dn-aliases.json')
var Commands = require('./dn-commands.js');

// args: array of arguments [0]: 'dragonNest' [1+]: parameters
// respond: reply function, see ../core.js
exports.eval = (args,message,interface) => {
  let command = Aliases[args[1]] || args[1];
  if(Commands[command] != undefined) {
    Commands[command].process(args,message,interface);
  }else{
    interface.message.reply(message,'Invalid subcommand, use `' + args[0] + ' help` for detailed usage information.');
  }
}
