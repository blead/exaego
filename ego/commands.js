var Aliases = require("./aliases.json");
var Dn = require("../plugins/dragonnest/dn-core.js");
var Fs = require("fs");
var Http = require("http");
var Triggers = require("./triggers.json");

module.exports = {
  "help" : {
    desc : "Display this help message. If a command is specified, give information about the command.",
    usage : "[command]",
    process : (args,respond) => {
      var messages = [];
      if(args.length==1) {
        messages.push("Use the following commands by sending `<trigger><command>`.\n");
        if(Triggers.prefix.length > 0)
          messages.push("Currently enabled trigger(s): `" + Triggers.prefix.join("`, `") + "`\n");
        messages.push("A direct mention i.e. `@Exaego <command>` always triggers the command.\n");
        messages.push("\n**Commands**: (`[...]`: optional parameters)\n");
        // list commands
        Object.keys(module.exports).forEach( (command) => {
          messages.push("\t`"+command+" "+module.exports[command].usage+"`\n");
          messages.push("\t\t: "+module.exports[command].desc+"\n");
        })
      }else if(module.exports[Aliases[args[1]]] != undefined) {
        if(args[1] != Aliases[args[1]]) {
          messages.push("Alias for `"+Aliases[args[1]]+"`\n");
        }
        messages.push("Usage: `"+args[1]+" "+module.exports[Aliases[args[1]]].usage+"`\n");
        messages.push("Description: "+module.exports[Aliases[args[1]]].desc+"\n");
      }else{
        messages.push("The specified command is invalid.");
      }
      respond(false,messages.join(""));
    }
  },
  "triggers" : {
    desc : "List all enabled triggers.",
    usage : "",
    process : (args,respond) => {
      if(Triggers.prefix.length > 0)
        respond(true,"Currently enabled trigger(s): `" + Triggers.prefix.join("`, `") + "`\n");
      else
        respond(true,"No trigger enabled.");
    }
  },
  "addTrigger" : {
    desc : "Add specified phrase(s) to the trigger list.",
    usage : "phrase1 [phrase2 phrase3 phrase4 ...]",
    process : (args,respond) => {
      if(args.length==1) {
        respond(false,"No phrase specified.");
        return;
      }
      for(i=1;i<args.length;i++) {
        Triggers.prefix.push(args[i]);
      }
      // filter non-unique triggers
      Triggers.prefix = Triggers.prefix.filter( (val,idx,self) => {
        return self.indexOf(val) === idx;
      } );
      // write to file
      Fs.writeFile("./ego/triggers.json",JSON.stringify(Triggers,null,2),(e) => {
        if(e) console.log(e);
        else{
          console.log("New trigger phrase(s) added to triggers.json.");
          respond(false,"New trigger phrase(s) added.");
        }
      });
    }
  },
  "removeTrigger" : {
    desc : "Remove specified phrase(s) from the trigger list.",
    usage : "phrase1 [phrase2 phrase3 phrase4 ...]",
    process : (args,respond) => {
      if(args.length==1) {
        respond(false,"No phrase specified.");
        return;
      }
      for(i=1;i<args.length;i++) {
        var idx = Triggers.prefix.indexOf(args[i]);
        if(idx != -1) Triggers.prefix.splice(idx,1);
      }
      // write to file
      Fs.writeFile("./ego/triggers.json",JSON.stringify(Triggers,null,2),(e) => {
        if(e) console.log(e);
        else{
          console.log("Trigger phrase(s) removed from triggers.json.");
          respond(false,"Trigger phrase(s) removed.");
        }
      });
    }
  },
  "hello" : {
    desc : "Display a friendly greeting message.",
    usage : "",
    process : (args,respond) => {
      respond(true,"ควย");
    }
  },
  "insult" : {
    desc : "Insult you the Elizabethan way.",
    usage : "[@target [@target2 @target3 @target4 ...]]",
    process : (args,respond) => {
      var message = [];
      Http.get("http://quandyfactory.com/insult/json", (res) => {
        res.on("data", (chunk) => {
          message.push(chunk);
        }).on("end", () => {
          message = JSON.parse(message.join("")).insult;
          if(args.length==1) {
            respond(true,message);
          }else{
            message = args.slice(1).join(" ") + " " + message;
            respond(false,message);
          }
        })
      }).on("error", (e) => console.log);
    }
  },
  "dragonNest" : {
    desc : "Calculate various in-game values for Dragon Nest. Use `dragonNest help` for detailed usage information.",
    usage : "<subcommand>",
    process : (args,respond) => {
      Dn.eval(args,respond);
    }
  }

};
