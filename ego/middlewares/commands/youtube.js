const ytdl = require('ytdl-core');

function youtube(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /(youtube)(?:\s+(.+))*/i;
  if (!localMessage.content) {
    return true;
  }
  const matches = pattern.exec(localMessage.content);
  if (matches === null) {
    return true;
  }
  const channel = localMessage.channel;
  if (typeof matches[2] !== 'string') {
    connector.channel.send(channel, [
      'Usage:',
      '`youtube <url>`',
      '`youtube stop`',
      '`youtube volume <volume>',
      '`youtube vol <volume>',
    ].join('\n'));
    return false;
  }
  const arguments = matches[2].split(/\s+/);
  if (arguments[0] === 'stop') {
    if (connectorContext.voiceChannel) {
      connector.voiceChannel.leave(connectorContext.voiceChannel);
      connectorContext.voiceChannel = null;
    }
  } else if (arguments[0] === 'volume' || arguments[0] === 'vol') {
    if (arguments[1] !== undefined && !Number.isNaN(new Number(arguments[1]))) {
      const volume = new Number(arguments[1]);
      localContext.streamOptions = {
        ...localContext.streamOptions,
        volume,
      };
      connector.channel.send(channel, `Volume set to ${volume}.`);
    } else {
      connector.channel.send(channel, 'No volume specified.');
    }
  } else {
    const streamOptions = localContext.streamOptions || {};
    const voiceChannel = connector.user.getVoiceChannel(localMessage.author, localMessage.guild);
    if (connectorContext.voiceChannel) {
      connector.voiceChannel.leave(connectorContext.voiceChannel);
      connectorContext.voiceChannel = null;
    }
    connector.voiceChannel.join(voiceChannel)
      .then((connection) => {
        const stream = ytdl(arguments[0], { quality: 'highestaudio', filter: 'audioonly', highWaterMark: 1<<29 /* 512mb */ });
        connectorContext.voiceChannel = voiceChannel;
        return connector.voiceConnection.playStream(connection, stream, streamOptions);
      })
      .then(() => {
        connectorContext.voiceChannel = null;
        return connector.voiceChannel.leave(voiceChannel);
      })
      .catch(error => {
        throw error;
      });
  }
  return false;
}

module.exports = youtube;
