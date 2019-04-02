const Aliases = require('./youtube-aliases.json');
const Log = require('../../utils/log.js');
const ytdl = require('ytdl-core-discord');

var Youtube = {
  'help' : {
    desc : 'Display this help message. If a subcommand is specified, give information about the subcommand.',
    usage : '[subcommand]',
    process : (args,message,interface) => {
      let command = Aliases[args[2]] || args[2];
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
      }else if(Youtube[command] != undefined) {
        if(args[2] != command) {
          responses.push('Alias for `' + command + '`\n');
        }
        responses.push('Usage: `' + args[0] + ' '+args[2] + ' ' + Youtube[command].usage + '`\n');
        responses.push('Description: ' + Youtube[command].desc + '\n');
      }else{
        responses.push('The specified subcommand is invalid.');
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'play' : {
    desc : 'Play a youtube video in your currently joined voice channel.',
    usage : '<url>',
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
      Promise.all([
        interface.voiceChannel.join(voiceChannel),
        ytdl(args[2],{quality: 'highestaudio', highWaterMark: 1<<24 /* 16mb */})
      ]).then( (values) => {
        const connection = values[0];
        const opusStream = values[1];
        interface.voiceConnection.playOpusStream(connection,opusStream).once('end', (reason) => {
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
