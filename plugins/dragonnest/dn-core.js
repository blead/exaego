var Aliases = require("./dn-aliases.json")
var Commands = require("./dn-commands.js");

// args: array of arguments [0]: "dragonNest" [1+]: parameters
// respond: reply function, see ../core.js
exports.eval = (args,respond) => {
  if(Commands[Aliases[args[1]]] != undefined) {
    Commands[Aliases[args[1]]].process(args,respond);
  }else{
    respond("Invalid subcommand, use `"+args[0]+" help` for detailed usage information.",{});
  }
}
