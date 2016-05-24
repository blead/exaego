var Aliases = require("./dn-aliases.json");
var Constants = require("./dn-constants.json");

function parseSuffix(arg) {
  var multiplier = 1;
  if(arg.endsWith("k") || arg.endsWith("K"))
    multiplier=1000;
  else if(arg.endsWith("m") || arg.endsWith("M"))
    multiplier=1000000;
  else if(arg.endsWith("b") || arg.endsWith("B"))
    multiplier=1000000000;
  
  return Number.parseInt(arg)*multiplier;
}

function dec(number,digits) {
  if(digits === undefined) digits=2;
  var operand = Math.pow(10,digits);

  return Math.round(number*operand)/operand;
}

module.exports = {
  "help" : {
    desc : "Display this help message. If a subcommand is specified, give information about the subcommand.",
    usage : "[subcommand]",
    process : (args,respond) => {
      var messages = [];
      if(args.length==2) {
        messages.push("__**Dragon Nest**__\n\n");
        messages.push("Use the following subcommands with `<trigger>"+args[0]+" <subcommand>`.\n");
        messages.push("\n**Subcommands**: (`[...]`: optional parameters)\n");
        // list commands
        Object.keys(module.exports).forEach( (command) => {
          messages.push("\t`"+args[0]+" "+command+" "+module.exports[command].usage+"`\n");
          messages.push("\t\t: "+module.exports[command].desc+"\n");
        })
      }else if(module.exports[Aliases[args[2]]] != undefined) {
        if(args[2] != Aliases[args[2]]) {
          messages.push("Alias for `"+Aliases[args[2]]+"`\n");
        }
        messages.push("Usage: `"+args[0]+" "+args[2]+" "+module.exports[Aliases[args[2]]].usage+"`\n");
        messages.push("Description: "+module.exports[Aliases[args[2]]].desc+"\n");
      }else{
        messages.push("The specified subcommand is invalid.");
      }
      respond(false,messages.join(""));
    }
  },
  "critical" : {
    desc : "Calculate in-game critical values.",
    usage : "<value[%]/cap> [level]",
    process : (args,respond) => {
      if(args.length < 3) {
        respond(true,"No value specified.");
        return;
      }

      // crit: numerical value, percent: value between 0 and 1
      var crit,percent;
      var level = (args.length==4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        respond(true,"The specified level is invalid.");
        return;
      }
      var messages = [];
      messages.push("Level "+level+" critical");

      if(args[2].endsWith("%")) {
        percent = Number.parseFloat(args[2])/100;
        if(percent < 0) {
          respond(true,"The specified value is invalid.");
          return;
        }
        crit = Constants.CRITICAL_CAPS[level-1] * percent;
        messages.push(": "+dec(crit)+" ("+dec(percent*100)+"%),");

      } else if(args[2] != "cap") {
        crit = parseSuffix(args[2]);
        if(isNaN(crit)) {
          respond(true,"The specified value is invalid.");
          return;
        }
        percent = Math.max(0,Math.min(crit/Constants.CRITICAL_CAPS[level-1],Constants.MAX_CRITICAL));
        messages.push(": "+dec(crit)+" ("+dec(percent*100)+"%),");
      }

      messages.push(" cap: "+dec(Constants.CRITICAL_CAPS[level-1]*Constants.MAX_CRITICAL)+" ("+(Constants.MAX_CRITICAL*100)+"%).");
      respond(true,messages.join(""));
    }
  }
};
