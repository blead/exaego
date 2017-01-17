var Aliases = require('./memo-aliases.json')
var Commands = require('./memo-commands.js');
try {
    var Memo = require('./memo-list.json');
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND')
    var Memo = {};
  else throw e;
}

// args: array of arguments [0]: 'memo' [1+]: parameters
// interface: reply function, see ../core.js
exports.eval = (args,message,interface) => {
  if(Commands[Aliases[args[1]]] != undefined) {
    Commands[Aliases[args[1]]].process(args,message,interface);
  } else if(Memo[args[1]] != undefined) {
    let responses = '`' + args[1] + '` :\n\t' + Memo[args[1]];
    responses = interface.message.replaceUserMentions(message,responses);
    interface.channel.sendMessage(interface.message.getChannel(message),responses);
  } else {
    interface.message.reply(message,'Entry not found/invalid subcommand, use `' + args[0] + ' help` for detailed usage information.')
  }
}
