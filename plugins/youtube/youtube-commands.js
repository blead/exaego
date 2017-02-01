const Aliases = require('./youtube-aliases.json');
const Log = require('../../utils/log.js');
const Ytdl = require('ytdl-core');

var Youtube = {
  'help' : {
    desc : 'Display this help message. If a subcommand is specified, give information about the subcommand.',
    usage : '[subcommand]',
    process : (args,message,interface) => {
      let responses = [];
      if(args.length==2) {
        responses.push('__**Youtube**__\n\n');
        responses.push('Play a video directly with `<trigger>' + args[0] + ' <url>`.\n');
        responses.push('Use the following subcommands with `<trigger>' + args[0] + ' <subcommand>`.\n');
        responses.push('\n**Subcommands**: (`[...]`: optional parameters)\n');
        // list commands
        Object.keys(Youtube).forEach( (command) => {
          responses.push('\t`' + args[0] + ' ' + command + ' ' + Youtube[command].usage + '`\n');
          responses.push('\t\t: ' + Youtube[command].desc + '\n');
        });
      }else if(Youtube[Aliases[args[2]]] != undefined) {
        if(args[2] != Aliases[args[2]]) {
          responses.push('Alias for `' + Aliases[args[2]] + '`\n');
        }
        responses.push('Usage: `' + args[0] + ' '+args[2] + ' ' + Youtube[Aliases[args[2]]].usage + '`\n');
        responses.push('Description: ' + Youtube[Aliases[args[2]]].desc + '\n');
      }else{
        responses.push('The specified subcommand is invalid.');
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'play' : {
    desc : 'Play a youtube video in your currently joined voice channel.',
    usage : 'url',
    process : (args,message,interface) => {
      let user = interface.message.getAuthor(message);
      let voiceChannel = interface.user.getVoiceChannel(user);
      if(!args[2]) {
        interface.message.reply(message,'No video specified, use `' + args[0] + ' help` for detailed usage information.');
        return;
      }
      if(!voiceChannel) {
        interface.message.reply(message,'Unable to join your voice channel.');
        return;
      }
      interface.voiceChannel.join(voiceChannel).then( (connection) => {
        let stream = Ytdl(args[2],{filter: 'audioonly'});
        interface.voiceConnection.playStream(connection,stream).once('end', (reason) => {
          interface.voiceChannel.leave(voiceChannel);
        });
      }).catch( (error) => {
        interface.message.reply(message,'Unable to load `' + args[2] + '`, use `' + args[0] + ' help` for detailed usage information.');
        Log(error);
      });
    }
  },
  'stop' : {
    desc : 'Stop playing all videos and leave the voice channel.',
    usage : '',
    process : (args,message,interface) => {
      let user = interface.message.getAuthor(message);
      let voiceChannel = interface.user.getVoiceChannel(user);
      if(voiceChannel) {
        interface.voiceChannel.leave(voiceChannel);
      }
    }
  }
};

module.exports = Youtube;
