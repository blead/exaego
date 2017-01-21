const Aliases = require('./aliases.json');
const Dn = require('../plugins/dragonnest/dn-core.js');
const Fs = require('fs');
const Http = require('http');
const Memo = require('../plugins/memo/memo-core.js');
var Triggers = require('./triggers.json');


function log(message) {
  console.log(new Date().toISOString() + " : " + message);
}


var Commands = {
  'help' : {
    desc : 'Display this help message. If a command is specified, give information about the command.',
    usage : '[command]',
    process : (args,message,interface) => {
      let guild = interface.guild.getId(interface.message.getGuild(message));
      let responses = [];
      if(args.length==1) {
        responses.push('Use the following commands by sending `<trigger><command>`.\n');
        if(Triggers[guild] === undefined)
          Triggers[guild] = Triggers.defaults;
        if(Triggers[guild].length > 0)
          responses.push('Currently enabled trigger(s): `' + Triggers[guild].join('`, `') + '`\n');
        responses.push('A direct mention i.e. `@Exaego <command>` always triggers the command.\n');
        responses.push('\n**Commands**: (`[...]`: optional parameters)\n');
        // list commands
        Object.keys(Commands).forEach( (command) => {
          responses.push('\t`' + command + ' ' + Commands[command].usage + '`\n');
          responses.push('\t\t: ' + Commands[command].desc + '\n');
        });
      } else if(Commands[Aliases[args[1]]] != undefined) {
        if(args[1] != Aliases[args[1]]) {
          responses.push('Alias for `' + Aliases[args[1]] + '`\n');
        }
        responses.push('Usage: `' + args[1] + ' ' + Commands[Aliases[args[1]]].usage + '`\n');
        responses.push('Description: ' + Commands[Aliases[args[1]]].desc + '\n');
      } else {
        responses.push('The specified command is invalid.');
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'triggers' : {
    desc : 'List all enabled triggers.',
    usage : '',
    process : (args,message,interface) => {
      let guild = interface.guild.getId(interface.message.getGuild(message));
      if(Triggers[guild] === undefined)
          Triggers[guild] = Triggers.defaults;
      if(Triggers[guild].length > 0)
        interface.channel.sendMessage(interface.message.getChannel(message),'Currently enabled trigger(s): `' + Triggers[guild].join('`, `') + '`\n');
      else
        interface.channel.sendMessage(interface.message.getChannel(message),'No trigger enabled.');
    }
  },
  'addTrigger' : {
    desc : 'Add specified phrase(s) to the trigger list.',
    usage : 'phrase1 [phrase2 phrase3 phrase4 ...]',
    process : (args,message,interface) => {
      let guild = interface.guild.getId(interface.message.getGuild(message));
      if(args.length==1) {
        interface.channel.sendMessage(interface.message.getChannel(message),'No phrase specified.');
        return;
      }
      if(Triggers[guild] === undefined)
          Triggers[guild] = Triggers.defaults;
      for(i=1;i<args.length;i++) {
        Triggers[guild].push(args[i]);
      }
      // filter non-unique triggers
      Triggers[guild] = Triggers[guild].filter( (val,idx,self) => {
        return self.indexOf(val) === idx;
      } );
      // write to file
      Fs.writeFileSync('./ego/triggers.json',JSON.stringify(Triggers,null,2));
      log('New trigger phrase(s) added to triggers.json.');
      interface.channel.sendMessage(interface.message.getChannel(message),'New trigger phrase(s) added.');
    }
  },
  'removeTrigger' : {
    desc : 'Remove specified phrase(s) from the trigger list.',
    usage : 'phrase1 [phrase2 phrase3 phrase4 ...]',
    process : (args,message,interface) => {
      let guild = interface.guild.getId(interface.message.getGuild(message));
      if(args.length==1) {
        interface('No phrase specified.',{});
        return;
      }
      if(Triggers[guild] === undefined)
          Triggers[guild] = Triggers.defaults;
      for(i=1;i<args.length;i++) {
        let idx = Triggers[guild].indexOf(args[i]);
        if(idx != -1) Triggers[guild].splice(idx,1);
      }
      // write to file
      Fs.writeFileSync('./ego/triggers.json',JSON.stringify(Triggers,null,2));
      log('Trigger phrase(s) removed from triggers.json.');
      interface.channel.sendMessage(interface.message.getChannel(message),'Trigger phrase(s) removed.');
    }
  },
  'hello' : {
    desc : 'Display a friendly greeting message.',
    usage : '',
    process : (args,message,interface) => {
      interface.message.reply(message,'ควย');
    }
  },
  'insult' : {
    desc : 'Insult you the Elizabethan way.',
    usage : '[@target [@target2 @target3 @target4 ...]]',
    process : (args,message,interface) => {
      let responses = [];
      interface.channel.startTyping(interface.message.getChannel(message));
      Http.get('http://quandyfactory.com/insult/json', (res) => {
        res.on('data', (chunk) => {
          responses.push(chunk);
        }).on('end', () => {
          responses = JSON.parse(responses.join('')).insult;
          interface.channel.stopTyping(interface.message.getChannel(message));
          if(args.length==1) {
            interface.message.reply(responses);
          }else{
            responses = args.slice(1).join(' ') + ' ' + responses;
            responses = interface.message.replaceUserMentions(message,responses);
            interface.channel.sendMessage(interface.message.getChannel(message),responses);
          }
        });
      }).on('error', log);
    }
  },
  'fuck' : {
    desc : 'Convert a sentence into a fucking great sentence.',
    usage : '[sentence]',
    process : (args,message,interface) => {
      const errorMessages= [
        'Fucking type something you piece of shit',
        'Stop fucking around',
        'Are you fucking kidding me?',
        'This would\'ve been a lot simpler if you weren\'t a fucking idiot',
        'Do I have to blow you to make you type something?',
        'I bet you are one of the people who think that global warming is a fucking conspiracy',
      ];
      if(args.length == 1) {
        interface.channel.sendMessage(interface.message.getChannel(message),errorMessages[Math.floor(Math.random()*errorMessages.length)]);
        return;
      }
      let responses = [];
      interface.channel.startTyping(interface.message.getChannel(message));
      Http.get('http://fuckinator.herokuapp.com/fuckinate?query=' + encodeURIComponent(args.slice(1).join(' ')), (res) => {
        res.on('data', (chunk) => {
          responses.push(chunk);
        }).on('end', () => {
          responses = decodeURIComponent(JSON.parse(responses.join('')).response);
          responses = interface.message.replaceUserMentions(message,responses);
          interface.channel.stopTyping(interface.message.getChannel(message));
          interface.channel.sendMessage(interface.message.getChannel(message),responses);
        });
      }).on('error', log);
    }
  },
  'dragonNest' : {
    desc : 'Calculate various in-game values for Dragon Nest. Use `dragonNest help` for detailed usage information.',
    usage : '<subcommand>',
    process : Dn.eval
  },
  'memo' : {
    desc : 'Store text entries. Use `memo help` for detailed usage information.',
    usage : '<subcommand>',
    process : Memo.eval
  }
};

module.exports = Commands;
