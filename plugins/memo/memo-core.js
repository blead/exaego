var Aliases = require("./memo-aliases.json")
var Commands = require("./memo-commands.js");
try {
    var Memo = require("./memo-list.json");
} catch (e) {
  if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
    var Memo = {};
  else throw e;
}

// args: array of arguments [0]: "memo" [1+]: parameters
// respond: reply function, see ../core.js
exports.eval = (args,respond) => {
  if(Commands[Aliases[args[1]]] != undefined) {
    Commands[Aliases[args[1]]].process(args,respond);
  } else if(Memo[args[1]] != undefined) {
    respond("**"+args[1]+"** :\n\t"+Memo[args[1]],{mentionParse: true});
  } else {
    respond("Entry not found/invalid subcommand, use `"+args[0]+" help` for detailed usage information.",{mentionPrefix: true});
  }
}
