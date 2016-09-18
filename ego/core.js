var Aliases = require("./aliases.json")
var Commands = require("./commands.js");
var Triggers = require("./triggers.json");

var User = null;

// user: User object
exports.setUserData = (data) => {
  User = data;
}

function isTrigger(message,identifier) {
  if(message.isMentioned(User)) return message.cleanContent.replace("@"+User.username,"").replace("#"+User.discriminator,"").trim();
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
exports.eval = (message,identifier,respond) => {
  if(User === null) console.log("Ego: User data not set");
  var args = isTrigger(message,identifier);
  if(args) {
    args = args.split(" ");
    if(Commands[Aliases[args[0]]] != undefined) {
      Commands[Aliases[args[0]]].process(args,identifier,respond);
    } else if(message.isMentioned(User)) {
      respond("Invalid command, use `@"+User.username+" help` for more information on commands.",{ mentionPrefix:true });
    }
  }
}
