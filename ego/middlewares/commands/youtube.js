const ytdl = require('ytdl-core');

function youtube(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /^\s*(youtube|yt)(?:\s+(.+))?/i;
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
      '`yt <url>`',
      '`youtube stop`',
      '`yt stop`',
    ].join('\n'));
  } else if (matches[2] === 'stop') {
    const voiceChannel = connectorContext.voiceChannel;
    if (voiceChannel) {
      connector.voiceChannel.leave(voiceChannel);
    }
  } else {
    const voiceChannel = connector.user.getVoiceChannel(localMessage.author, localMessage.guild);
    connector.voiceChannel.join(voiceChannel)
      .then((connection) => {
        const stream = ytdl(matches[2], { quality: 'highestaudio', highWaterMark: 1<<24 /* 16mb */ });
        connectorContext.voiceChannel = voiceChannel;
        return connector.voiceConnection.playStream(connection, stream);
      })
      .then(() => {
        delete connectorContext.voiceChannel;
        return connector.voiceChannel.leave(voiceChannel);
      })
      .catch(error => {
        throw error;
      });
  }
  return false;
}

module.exports = youtube;
