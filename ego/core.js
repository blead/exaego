const Aliases = require('./aliases.json');
const Commands = require('./commands.js');
var Triggers = require('./triggers.json');

function Ego(interface) {
  this.interface = interface;
}

Ego.prototype.message = function message(message) {
  eval(message,this.interface);
}

function eval(message,interface) {
  let content = getContent(message,interface);
  if(content) {
    let args = content.split(' ');
    if(Commands[Aliases[args[0]]] != undefined)
      Commands[Aliases[args[0]]].process(args,message,interface);
    else if(interface.message.isMentioned(message,interface.user.SELF))
      interface.message.reply(message,'Invalid command, use `help` for more information on commands.');
  }
}

function getContent(message,interface) {
  let author = interface.message.getAuthor(message);
  let guild = interface.message.getGuild(message);

  if(interface.user.isBot(author) || interface.user.getId(author) === interface.user.getId(interface.user.SELF))
    return '';

  if(guild) {
    let cleanContent = interface.message.getCleanContent(message);
    if(interface.message.isMentioned(message,interface.user.SELF)) {
      let regex = new RegExp('@?' + interface.user.getUsername(interface.user.SELF) + '(#' + interface.user.getId(interface.user.SELF) + ')?');
      return cleanContent.replace(regex,'').trim();
    }
    if(Triggers[guild] === undefined)
      Triggers[guild] = Triggers.defaults;
    for(let trigger of Triggers[guild])
      if(cleanContent.startsWith(trigger)) return cleanContent.replace(trigger,'').trim();
  } else {
    // DM
  }
  return '';
}

module.exports = Ego;
