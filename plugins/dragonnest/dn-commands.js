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

function calculatePercent(val,maxVal,cap) {
  return Math.max(0,Math.min(val/maxVal,cap));
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
        messages.push("Default level: `"+Constants.LEVEL+"`\n");
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
      respond(messages.join(""),{});
    }
  },
  "critical" : {
    desc : "Calculate in-game critical values.",
    usage : "<value[%]/cap> [level]",
    process : (args,respond) => {
      if(args.length < 3) {
        respond("No value specified.",{mentionPrefix: true});
        return;
      }

      // crit: numerical value, percent: value between 0 and 1
      var crit,percent;
      var level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        respond("The specified level is invalid.",{mentionPrefix: true});
        return;
      }
      var messages = [],critCap = Constants.CRITICAL_CAPS[level-1];
      messages.push("Level "+level+" critical");

      if(args[2].endsWith("%")) {
        percent = Number.parseFloat(args[2])/100;
        if(percent < 0) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        crit = critCap * percent;
        messages.push(": `"+dec(crit)+"` (`"+dec(percent*100)+"%`),");

      } else if(args[2] != "cap") {
        crit = parseSuffix(args[2]);
        if(isNaN(crit)) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        percent = calculatePercent(crit,critCap,Constants.MAX_CRITICAL);
        messages.push(": `"+dec(crit)+"` (`"+dec(percent*100)+"%`),");
      }

      messages.push(" cap: `"+dec(critCap*Constants.MAX_CRITICAL)+"` (`"+(Constants.MAX_CRITICAL*100)+"%`)");
      respond(messages.join(""),{mentionPrefix: true});
    }
  },
  "criticalDamage" : {
    desc : "Calculate in-game critical damage values.",
    usage : "<value[%]/cap> [level]",
    process : (args,respond) => {
      if(args.length < 3) {
        respond("No value specified.",{mentionPrefix: true});
        return;
      }

      // critdmg: numerical value, percent: value between 0 and 1
      var critdmg,percent;
      var level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        respond("The specified level is invalid.",{mentionPrefix: true});
        return;
      }
      var messages = [],critdmgCap = Constants.CRITICAL_DAMAGE_CAPS[level-1];
      messages.push("Level "+level+" critical damage");

      if(args[2].endsWith("%")) {
        percent = Number.parseFloat(args[2])/100 - 2;
        if(percent < 0) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        critdmg = critdmgCap * percent;
        percent += 2;
        messages.push(": `"+dec(critdmg)+"` (`"+dec(percent*100)+"%`),");

      } else if(args[2] != "cap") {
        critdmg = parseSuffix(args[2]);
        if(isNaN(critdmg)) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        percent = calculatePercent(critdmg,critdmgCap,Constants.MAX_CRITICAL_DAMAGE) + 2;
        messages.push(": `"+dec(critdmg)+"` (`"+dec(percent*100)+"%`),");
      }

      messages.push(" cap: `"+dec(critdmgCap*Constants.MAX_CRITICAL_DAMAGE)+"` (`"+(Constants.MAX_CRITICAL_DAMAGE*100+200)+"%`)");
      respond(messages.join(""),{mentionPrefix: true});
    }
  },
  "defense" : {
    desc : "Calculate in-game defense values and effective HP for each damage type.",
    usage : "HP P.Def M.Def [level]",
    process : (args,respond) => {
      if(args.length < 3) {
        respond("No value specified.",{mentionPrefix: true});
        return;
      } else if(args.length < 5) {
        respond("Insufficient parameters. Use `"+args[0]+" help "+args[1]+"` for correct usage information.",{mentionPrefix: true});
        return;
      }

      var level = (args.length>=6) ? Number.parseInt(args[5]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        respond("The specified level is invalid.",{mentionPrefix: true});
        return;
      }
      var defCap = Constants.DEFENSE_CAPS[level-1];

      var rawHP = parseSuffix(args[2]), rawPDef = parseSuffix(args[3]), rawMDef = parseSuffix(args[4]);
      if(isNaN(rawHP) || isNaN(rawPDef) || isNaN(rawMDef) || rawHP < 0 || rawPDef < 0 || rawMDef < 0) {
        respond("The specified values are invalid.",{mentionPrefix: true});
      }

      var percentPDef = calculatePercent(rawPDef,defCap,Constants.MAX_DEFENSE);
      var percentMDef = calculatePercent(rawMDef,defCap,Constants.MAX_DEFENSE);

      var effectivePHP = rawHP/(1-percentPDef);
      var effectiveMHP = rawHP/(1-percentMDef);
      var messages = [];
      messages.push("Level "+level+" defense:\n");
      messages.push("defense cap: `"+dec(defCap*Constants.MAX_DEFENSE)+"` (`"+Constants.MAX_DEFENSE*100+"%`)\n");
      messages.push("physical defense: `"+rawPDef+"` (`"+dec(percentPDef*100)+"%`)\n");
      messages.push("magic defense: `"+rawMDef+"` (`"+dec(percentMDef*100)+"%`)\n");
      messages.push("effective physical HP: `"+dec(effectivePHP)+"`\n");
      messages.push("effective magical HP: `"+dec(effectiveMHP)+"`\n");
      respond(messages.join(""),{mentionPrefix: true});
    }
  },
  "finalDamage" : {
    desc : "Calculate in-game final damage values.",
    usage : "<value[%]/cap> [level]",
    process : (args,respond) => {
      if(args.length < 3) {
        respond("No value specified.",{mentionPrefix: true});
        return;
      }

      // fd: numerical value, percent: value between 0 and 1
      var fd,percent;
      var level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        respond("The specified level is invalid.",{mentionPrefix: true});
        return;
      }
      var messages = [],fdCap = Constants.FINAL_DAMAGE_CAPS[level-1];
      messages.push("Level "+level+" final damage");

      if(args[2].endsWith("%")) {
        percent = Number.parseFloat(args[2])/100;
        if(percent < 0) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        if(percent < 0.146) {
          fd = 2.857142857 * percent * fdCap;
        } else {
          fd = Math.pow(percent,1/2.2) * fdCap;
        }
        messages.push(": `"+dec(fd)+"` (`"+dec(percent*100)+"%`),");

      } else if(args[2] != "cap") {
        fd = parseSuffix(args[2]);
        if(isNaN(fd)) {
          respond("The specified value is invalid.",{mentionPrefix: true});
          return;
        }
        var ratio = fd/fdCap;
        if(ratio < 0.417) {
          percent = (0.35*fd)/fdCap;
        } else {
          percent = Math.pow(ratio,2.2);
        }

        percent = calculatePercent(percent,1,Constants.MAX_FINAL_DAMAGE);
        messages.push(": `"+dec(fd)+"` (`"+dec(percent*100)+"%`),");
      }

      messages.push(" cap: `"+dec(fdCap*Constants.MAX_FINAL_DAMAGE)+"` (`"+(Constants.MAX_FINAL_DAMAGE*100)+"%`)");
      respond(messages.join(""),{mentionPrefix: true});
    }
  }
};
