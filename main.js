var Config = require("./config.json");
var Discord = require("discord.js");
var Ego = require("./ego/core.js");
var Http = require("http");

var bot = new Discord.Client({autoReconnect: true});

function error(e) {
  console.log(new Date().toISOString() + '\n' + e);
}

bot.on("ready", () => {
  console.log("Client ready");
  bot.setStatus("online",Config.playing).catch(error);
  Ego.setUserData(bot.user);
}).on("message", (message) => {
  Ego.eval(message, message.channel.server.id, (content,options) => {
    if(options.mentionParse)
      for(user of message.mentions)
        content = content.replace(new RegExp("@"+user.username+"(#"+user.discriminator+")?","g"),user.mention());
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

var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var web = Http.createServer( (request,response) => {
  var message = "Redirecting to Github!"
  response.writeHead(301,{
    "Location" : "https://github.com/blead/exaego",
    "Content-Length" : message.length,
    "Content-Type" : "text/plain"
  });
  response.end(message);
}).listen(port, ip, () => { console.log("Web server listening on "+ip+":"+port); });
