const Config = require('./config.json');
const Discord = require('discord.js');
const Ego = require('./ego/core.js');
const Http = require('http');
const Log = require('./utils/log.js');

var discord = new Discord.Client();
var discordEgo;

discord.login(Config.oauth2Token).then( () => {
  Log('Login successful');
}).catch(Log);

discord.on('ready', () => {
  discord.user.setGame(Config.playing).catch(Log);
  Log('client ready');
  discordEgo = new Ego({
    channel: {
      sendEmbed: (channel,embed) => channel.sendEmbed(embed),
      sendMessage: (channel,content) => channel.sendMessage(content),
      startTyping: channel => channel.startTyping(),
      stopTyping: channel => channel.stopTyping(true)
    },
    embed: {
      create: () => new Discord.RichEmbed(),
      setTitle: (embed,title) => embed.setTitle(title),
      setDescription: (embed,description) => embed.setDescription(description),
      setImageURL: (embed,url) => embed.setImage(url)
    },
    guild: {
      getId: guild => guild.id
    },
    message: {
      getAuthor: message => message.member || message.author,
      getChannel: message => message.channel,
      getContent: message => message.content,
      getCleanContent: message => message.cleanContent,
      getGuild: message => message.guild,
      getUserMentions: message => message.mentions.users,
      isMentioned: (message,user) => message.isMentioned(user),
      replaceUserMentions: (message,content) => {
        message.mentions.users.forEach( user => { content = content.replace(new RegExp('@?' + user.username + '(#' + user.id + ')?','g'),user.toString()) } );
        return content;
      },
      reply: (message,content) => message.channel.sendMessage(message.author.toString() + ' ' + content)
    },
    user: {
      self: () => discord.user,
      getAvatarURL: user => user instanceof Discord.GuildMember ? user.user.avatarURL : user.avatarURL,
      getId: user => user.id,
      getUsername: user => user instanceof Discord.GuildMember ? user.user.username : user.username,
      getVoiceChannel: user => user instanceof Discord.GuildMember ? user.voiceChannel : null,
      isBot: user => user instanceof Discord.GuildMember ? user.user.bot : user.bot,
      toString: user => user.toString()
    },
    voiceChannel: {
      join: voiceChannel => voiceChannel.join(),
      leave: voiceChannel => voiceChannel.leave()
    },
    voiceConnection: {
      playStream: (voiceConnection,stream) => voiceConnection.playStream(stream),
      playOpusStream: (voiceConnection,opusStream) => voiceConnection.playOpusStream(opusStream)
    }
  });
}).on('message', message => discordEgo.message(message)).on('warn', Log).on('error', Log);

var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var web = Http.createServer( (request,response) => {
  var message = 'Redirecting to Github!'
  response.writeHead(301,{
    'Location' : 'https://github.com/blead/exaego',
    'Content-Length' : message.length,
    'Content-Type' : 'text/plain'
  });
  response.end(message);
}).listen(port, ip, () => { Log('web server listening on '+ip+':'+port); });
