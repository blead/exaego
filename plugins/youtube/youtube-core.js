var Aliases = require('./youtube-aliases.json')
var Commands = require('./youtube-commands.js');

exports.eval = (args,message,interface) => {
  let command = Aliases[args[1]] || args[1];
  if(Commands[command] != undefined) {
    Commands[command].process(args,message,interface);
  }else{
    args.splice(1,0,'play');
    Commands['play'].process(args,message,interface);
  }
}
