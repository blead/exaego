var Aliases = require("./aliases.json")
var Commands = require("./commands.js");
var Triggers = require("./triggers.json");

var Interface = null;

// user: User object
exports.init = (interface) => {
  Interface = interface;
}

function isTrigger(message,identifier) {
  if(message.isMentioned(interface.user)) return message.cleanContent.replace("@"+interface.user.username,"").trim();
  if(Triggers[identifier] === undefined)
    Triggers[identifier] = Triggers.prefix;
  for(var trigger of Triggers[identifier]) {
    if(message.cleanContent.startsWith(trigger)) return message.cleanContent.replace(trigger,"").trim();
  }
  return false;
}

// message: Message object
// respond: reply function (contentString,{options})
// options: { mentionPrefix, mentionParse }
exports.eval = (message,identifier) => {
  if(interface.user === null) console.log("Ego: User data not set");
  var args = isTrigger(message,identifier);
  if(args) {
    args = args.split(" ");
    if(Commands[Aliases[args[0]]] != undefined) {
      Commands[Aliases[args[0]]].process(args,identifier,interface.respond);
    } else if(message.isMentioned(interface.user)) {
      respond("Invalid command, use `@"+interface.user.username+" help` for more information on commands.",{ mentionPrefix:true });
    }
  }
}
