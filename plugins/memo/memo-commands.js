const Aliases = require('./memo-aliases.json');
const Fs = require('fs');
try {
    var Memo = require('./memo-list.json');
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND')
    var Memo = {};
  else throw e;
}

var Memo = {
  'help' : {
    desc : 'Display this help message. If a subcommand is specified, give information about the subcommand.',
    usage : '[subcommand]',
    process : (args,message,interface) => {
      let responses = [];
      if(args.length==2) {
        responses.push('__**Memo**__\n\n');
        responses.push('Access memo entries directly with `<trigger>' + args[0] + ' <entry name>`.\n');
        responses.push('Use the following subcommands with `<trigger>' + args[0] + ' <subcommand>`.\n');
        responses.push('\n**Subcommands**: (`[...]`: optional parameters)\n');
        // list commands
        Object.keys(Memo).forEach( (command) => {
          responses.push('\t`' + args[0] + ' ' + command + ' ' + Memo[command].usage + '`\n');
          responses.push('\t\t: ' + Memo[command].desc + '\n');
        });
      }else if(Memo[Aliases[args[2]]] != undefined) {
        if(args[2] != Aliases[args[2]]) {
          responses.push('Alias for `' + Aliases[args[2]] + '`\n');
        }
        responses.push('Usage: `' + args[0] + ' ' + args[2] + ' ' + Memo[Aliases[args[2]]].usage + '`\n');
        responses.push('Description: ' + Memo[Aliases[args[2]]].desc + '\n');
      }else{
        responses.push('The specified subcommand is invalid.');
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'add' : {
    desc : 'Add the specified entry.',
    usage : '<entry name> <content>',
    process : (args,message,interface) => {
      let guild = interface.message.getGuild(message);
      if(args.length < 4) {
        interface.message.reply(message,'Insufficient parameters. Use `' + args[0] + ' help ' + args[1] + '` for correct usage information.');
        return;
      }
      if(Memo[guild] === undefined)
        Memo[guild] = {};
      if(Memo[guild][args[2]] != undefined) {
        interface.message.reply(message,'Entry `' + args[2] + '` already exists. Use `' + args[0] + ' modify ' + args[2] + '` instead.');
        return;
      }
      if(args[2].includes('`')) {
        interface.message.reply(message,'Entry names cannot contain grave accent for formatting reasons. Please use a different name.');
        return;
      }
      args[3] = args.slice(3).join(' ');
      Memo[guild][args[2]] = args[3];
      Fs.writeFileSync('./plugins/memo/memo-list.json',JSON.stringify(Memo,null,2));
      interface.channel.sendMessage(interface.message.getChannel(message),'Entry added.');
    }
  },
  'remove' : {
    desc : 'Remove the specified entry.',
    usage : '<entry name>',
    process : (args,message,interface) => {
      let guild = interface.message.getGuild(message);
      if(args.length < 3) {
        interface.message.reply(message,'Insufficient parameters. Use `' + args[0] + ' help ' + args[1] + '` for correct usage information.');
        return;
      }
      if(Memo[guild] === undefined)
        Memo[guild] = {};
      if(Memo[guild][args[2]] != undefined) {
        let responses = [];
        responses.push('The following entry will be removed.\n`' + args[2] + '` :\n\t' + Memo[guild][args[2]] + '\n');
        delete Memo[guild][args[2]];
        Fs.writeFileSync('./plugins/memo/memo-list.json',JSON.stringify(Memo,null,2));
        responses.push('Entry removed.');
        interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
      } else {
        interface.message.reply(message,'Entry not found');
      }
    }
  },
  'modify' : {
    desc : 'Modify the specified entry.',
    usage : '<entry name> <new content>',
    process : (args,message,interface) => {
      let guild = interface.message.getGuild(message);
      if(args.length < 4) {
        interface.message.reply(message,'Insufficient parameters. Use `' + args[0] + ' help ' + args[1] + '` for correct usage information.');
        return;
      }
      if(Memo[guild] === undefined)
        Memo[guild] = {};
      if(Memo[guild][args[2]] != undefined) {
        let responses = [];
        responses.push('The following entry will be modified.\n`' + args[2] + '` :\n\t' + Memo[guild][args[2]] + '\n');
        args[3] = args.slice(3).join(' ');
        Memo[guild][args[2]] = args[3];
        Fs.writeFileSync('./plugins/memo/memo-list.json',JSON.stringify(Memo,null,2));
        responses.push('Entry modified.');
        interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
      } else {
        interface.message.reply(message,'Entry not found');
      }
    }
  },
  'list' : {
    desc : 'List all entries.',
    usage : '',
    process : (args,message,interface) => {
      let guild = interface.message.getGuild(message);
      let responses = [];
      if(Memo[guild] === undefined)
        Memo[guild] = {};
      if(Object.keys(Memo[guild]).length === 0) {
        responses.push('No entry found.');
      } else {
        Object.keys(Memo[guild]).forEach( (entry) => {
          responses.push('`' + entry + '` :\n');
          responses.push('\t' + Memo[guild][entry] + '\n');
        });
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  }
}

module.exports = Memo;
