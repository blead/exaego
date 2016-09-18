var Config = require("./config.json");
var Discord = require("discord.js");
var Ego = require("./ego/core.js");
var Http = require("http");

var bot = new Discord.Client({autoReconnect: true});

bot.on("ready", () => {
  console.log("Client ready");
  bot.setStatus("online",Config.playing).catch(console.log);
  Ego.init({
    user: bot.user,
    respond: (content,message,options) => {
      if(options.mentionParse)
        for(user of message.mentions)
          content = content.replace(new RegExp("@"+user.username,"g"),user.mention());
      if(options.mentionPrefix) content = message.author.mention()+" "+content;
      bot.sendMessage(message.channel,content).catch(console.log);
    }
  });
}).on("message", (message) => {
  Ego.eval(message, message.channel.server.id);
// }).on("messageUpdated", (before,after) => {
  // do something
}).on("error", console.log);

bot.loginWithToken(Config.oauth2Token).then( (token) => {
  console.log("Login successful");
}).catch(console.log);
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
