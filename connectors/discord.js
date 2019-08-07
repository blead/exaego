const Discord = require('discord.js');
const Connector = require('./connector');
const Logger = require('../utils/logger');

class DiscordConnector extends Connector {
  static id = 'discord';
  context = {
    triggers: {},
  };
  discord;
  logger;
  channel = {
    send: (channel, message) => channel.send(message),
  };
  guild = {
    getName: guild => guild.name,
  };
  message = {
    getMessageContent: message => message.content,
    getMessageMetadata: message => ({
      author: message.author,
      channel: message.channel,
      guild: message.guild,
    }),
    isMentioned: (message, user) => message.isMentioned(user),
  };
  user = {
    self: () => this.discord.user,
    isBot: user => user.bot,
    getVoiceChannel: (user, guild) => guild.member(user).voiceChannel,
  };
  voiceChannel = {
    join: voiceChannel => voiceChannel.join(),
    leave: voiceChannel => voiceChannel.leave(),
  };
  voiceConnection = {
    playStream: (voiceConnection, stream) => new Promise((resolve, reject) => {
        const dispatcher = voiceConnection.playStream(stream);
        dispatcher
          .on('end', resolve)
          .on('error', reject);
      }),
  };

  constructor(config) {
    super();
    this.discord = new Discord.Client();
    this.logger = new Logger('DISCORD');
    this.user.self.bind(this);
    this.discord
      .on('ready', () => {
        this.discord.user.setActivity(config.activity)
          .catch(this.logger.error);
        this.logger.log('client ready');
      })
      .on('message', message => this.emit('message', message, this.context))
      .on('warn', this.logger.log)
      .on('error', this.logger.error)
      .login(config.token)
        .then(() => this.logger.log('login successful'))
        .catch(this.logger.error);
  }
}

module.exports = DiscordConnector;
