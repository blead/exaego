var Aliases = require("./memo-aliases.json");
var Fs = require("fs");
try {
    var Memo = require("./memo-list.json");
} catch (e) {
  if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
    var Memo = {};
  else throw e;
}

module.exports = {
  "help" : {
    desc : "Display this help message. If a subcommand is specified, give information about the subcommand.",
    usage : "[subcommand]",
    process : (args,respond) => {
      var messages = [];
      if(args.length==2) {
        messages.push("__**Memo**__\n\n");
        messages.push("Access memo entries directly with `<trigger>"+args[0]+" <entry name>`.\n");
        messages.push("Use the following subcommands with `<trigger>"+args[0]+" <subcommand>`.\n");
        messages.push("\n**Subcommands**: (`[...]`: optional parameters)\n");
        // list commands
        Object.keys(module.exports).forEach( (command) => {
          messages.push("\t`"+args[0]+" "+command+" "+module.exports[command].usage+"`\n");
          messages.push("\t\t: "+module.exports[command].desc+"\n");
        });
      }else if(module.exports[Aliases[args[2]]] != undefined) {
        if(args[2] != Aliases[args[2]]) {
          messages.push("Alias for `"+Aliases[args[2]]+"`\n");
        }
        messages.push("Usage: `"+args[0]+" "+args[2]+" "+module.exports[Aliases[args[2]]].usage+"`\n");
        messages.push("Description: "+module.exports[Aliases[args[2]]].desc+"\n");
      }else{
        messages.push("The specified subcommand is invalid.");
      }
      respond(messages.join(""),{});
    }
  },
  "add" : {
    desc : "Add the specified entry.",
    usage : "<entry name> <content>",
    process : (args,respond) => {
      if(args.length < 4) {
        respond("Insufficient parameters. Use `"+args[0]+" help "+args[1]+"` for correct usage information.",{mentionPrefix: true});
        return;
      }
      if(Memo[args[2]] != undefined) {
        respond("Entry **"+args[2]+"** already exists. Use `"+args[0]+" modify "+args[2]+"` instead.",{mentionPrefix: true});
        return;
      }
      args[3] = args.slice(3).join(" ");
      Memo[args[2]] = args[3];
      Fs.writeFile("./plugins/memo/memo-list.json",JSON.stringify(Memo,null,2),(e) => {
        if(e) console.log(e);
        else respond("Entry added.",{});
      });
    }
  },
  "remove" : {
    desc : "Remove the specified entry.",
    usage : "<entry name>",
    process : (args,respond) => {
      if(args.length < 3) {
        respond("Insufficient parameters. Use `"+args[0]+" help "+args[1]+"` for correct usage information.",{mentionPrefix: true});
        return;
      }
      if(Memo[args[2]] != undefined) {
        var messages = [];
        messages.push("The following entry will be removed.\n**"+args[2]+"** :\n\t"+Memo[args[2]]+"\n");
        delete Memo[args[2]];
        Fs.writeFile("./plugins/memo/memo-list.json",JSON.stringify(Memo,null,2),(e) => {
          if(e) console.log(e);
          else {
            messages.push("Entry removed.");
            respond(messages.join(""),{});
          }
        });
      } else {
        respond("Entry not found",{mentionPrefix: true});
      }
    }
  },
  "modify" : {
    desc : "Modify the specified entry.",
    usage : "<entry name> <new content>",
    process : (args,respond) => {
      if(args.length < 4) {
        respond("Insufficient parameters. Use `"+args[0]+" help "+args[1]+"` for correct usage information.",{mentionPrefix: true});
        return;
      }
      if(Memo[args[2]] != undefined) {
        var messages = [];
        messages.push("The following entry will be modified.\n**"+args[2]+"** :\n\t"+Memo[args[2]]+"\n");
        args[3] = args.slice(3).join(" ");
        Memo[args[2]] = args[3];
        Fs.writeFile("./plugins/memo/memo-list.json",JSON.stringify(Memo,null,2),(e) => {
          if(e) console.log(e);
          else {
            messages.push("Entry modified.");
            respond(messages.join(""),{});
          }
        });
      } else {
        respond("Entry not found",{mentionPrefix: true});
      }
    }
  },
  "list" : {
    desc : "List all entries.",
    usage : "",
    process : (args,respond) => {
      var messages = [];
      if(Object.keys(Memo).length === 0) {
        messages.push("No entry found.");
      } else {
        Object.keys(Memo).forEach( (entry) => {
          messages.push("**"+entry+"** :\n");
          messages.push("\t"+Memo[entry]+"\n");
        });
      }
      respond(messages.join(""),{});
    }
  }
}
