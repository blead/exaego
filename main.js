var Config = require("./config.json");
var Discord = require("discord.js");
var Ego = require("./ego/core.js");

var bot = new Discord.Client({autoReconnect: true});

function error(e) {
  console.log(e);
}

bot.on("ready", () => {
  console.log("Client ready");
  bot.setStatus("online",Config.playing).catch(error);
  Ego.setUserData(bot.user);
}).on("message", (message) => {
  Ego.eval(message, (content,options) => {
    if(options.mentionParse)
      for(user of message.mentions)
        content.replace("/@"+user.username+"/g",user.mention());
    if(options.mentionPrefix) content = message.author.mention()+" "+content;
    bot.sendMessage(message.channel,content).catch(error);
  });
// }).on("messageUpdated", (before,after) => {
  //do something
}).on("error", error);

bot.loginWithToken(Config.oauth2Token).then( (token) => {
  console.log("Login successful");
}).catch(error);
// For email/password login, use bot.login("email", "password");
