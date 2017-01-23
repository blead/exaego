var Aliases = require('./youtube-aliases.json')
var Commands = require('./youtube-commands.js');

// args: array of arguments [0]: 'youtube' [1+]: parameters
// respond: reply function, see ../core.js
exports.eval = (args,message,interface) => {
  if(Commands[Aliases[args[1]]] != undefined) {
    Commands[Aliases[args[1]]].process(args,message,interface);
  }else{
    args.splice(1,0,'play');
    Commands['play'].process(args,message,interface);
    // interface.message.reply(message,'Invalid subcommand, use `' + args[0] + ' help` for detailed usage information.');
  }
}
