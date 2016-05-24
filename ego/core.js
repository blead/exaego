var Aliases = require("./aliases.json")
var Commands = require("./commands.js");
var Triggers = require("./triggers.json");

var User = null;

// user: User object
exports.setUserData = (data) => {
  User = data;
}

function isTrigger(message) {
  if(message.isMentioned(User)) return message.cleanContent.replace("@"+User.username,"").trim();
  for(var trigger of Triggers.prefix) {
    if(message.cleanContent.startsWith(trigger)) return message.cleanContent.replace(trigger,"").trim();
  }
  return false;
}

// message: Message object
// respond: reply function (@mention:{true/false},contentString)
exports.eval = (message,respond) => {
  if(User === null) console.log("Ego: User data not set");
  var args = isTrigger(message);
  if(args) {
    args = args.split(" ");
    if(Commands[Aliases[args[0]]] != undefined) {
      Commands[Aliases[args[0]]].process(args,respond);
    }else{
      respond(false,"Invalid command, use `help` for more information on commands.");
    }
  }
}
