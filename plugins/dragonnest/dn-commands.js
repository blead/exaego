const Aliases = require('./dn-aliases.json');
const Constants = require('./dn-constants.json');

function parseSuffix(arg) {
  let multiplier = 1;
  if(arg.endsWith('k') || arg.endsWith('K'))
    multiplier=1000;
  else if(arg.endsWith('m') || arg.endsWith('M'))
    multiplier=1000000;
  else if(arg.endsWith('b') || arg.endsWith('B'))
    multiplier=1000000000;
  
  return Number.parseInt(arg)*multiplier;
}

function dec(number,digits) {
  if(digits === undefined) digits=2;
  let operand = Math.pow(10,digits);

  return Math.round(number*operand)/operand;
}

function calculatePercent(val,maxVal,cap) {
  return Math.max(0,Math.min(val/maxVal,cap));
}

var Dn = {
  'help' : {
    desc : 'Display this help message. If a subcommand is specified, give information about the subcommand.',
    usage : '[subcommand]',
    process : (args,message,interface) => {
      let command = Aliases[args[2]] || args[2];
      let responses = [];
      if(args.length==2) {
        responses.push('__**Dragon Nest**__\n\n');
        responses.push('Use the following subcommands with `<trigger>' + args[0] + ' <subcommand>`.\n');
        responses.push('Default level: `' + Constants.LEVEL + '`\n');
        responses.push('\n**Subcommands**: (`[...]`: optional parameters)\n');
        // list commands
        Object.keys(Dn).forEach( (command) => {
          responses.push('\t`' + args[0] + ' ' + command + ' ' + Dn[command].usage + '`\n');
          responses.push('\t\t: ' + Dn[command].desc + '\n');
        });
      }else if(Dn[command] != undefined) {
        if(args[2] != command) {
          responses.push('Alias for `' + command + '`\n');
        }
        responses.push('Usage: `' + args[0] + ' '+args[2] + ' ' + Dn[command].usage + '`\n');
        responses.push('Description: ' + Dn[command].desc + '\n');
      }else{
        responses.push('The specified subcommand is invalid.');
      }
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'critical' : {
    desc : 'Calculate in-game critical values.',
    usage : '<value[%]/cap> [level]',
    process : (args,message,interface) => {
      if(args.length < 3) {
        interface.message.reply(message,'No value specified.');
        return;
      }

      // crit: numerical value, percent: value between 0 and 1
      let crit,percent;
      let level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        interface.message.reply(message,'The specified level is invalid.');
        return;
      }
      let responses = [],critCap = Constants.CRITICAL_CAPS[level-1];
      responses.push('Level ' + level + ' critical');

      if(args[2].endsWith('%')) {
        percent = Number.parseFloat(args[2])/100;
        if(percent < 0) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        crit = critCap * percent;
        responses.push(': `' + dec(crit) + '` (`' + dec(percent*100) + '%`),');

      } else if(args[2] != 'cap') {
        crit = parseSuffix(args[2]);
        if(isNaN(crit)) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        percent = calculatePercent(crit,critCap,Constants.MAX_CRITICAL);
        responses.push(': `' + dec(crit) + '` (`' + dec(percent*100) + '%`),');
      }

      responses.push(' cap: `' + dec(critCap*Constants.MAX_CRITICAL) + '` (`' + (Constants.MAX_CRITICAL*100) + '%`)');
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'criticalDamage' : {
    desc : 'Calculate in-game critical damage values.',
    usage : '<value[%]/cap> [level]',
    process : (args,message,interface) => {
      if(args.length < 3) {
        interface.message.reply(message,'No value specified.');
        return;
      }

      // critdmg: numerical value, percent: value between 0 and 1
      let critdmg,percent;
      let level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        interface.message.reply(message,'The specified level is invalid.');
        return;
      }
      let responses = [],critdmgCap = Constants.CRITICAL_DAMAGE_CAPS[level-1];
      responses.push('Level ' + level + ' critical damage');

      if(args[2].endsWith('%')) {
        percent = Number.parseFloat(args[2])/100 - 2;
        if(percent < 0) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        critdmg = critdmgCap * percent;
        percent += 2;
        responses.push(': `' + dec(critdmg) + '` (`' + dec(percent*100) + '%`),');
      } else if(args[2] != 'cap') {
        critdmg = parseSuffix(args[2]);
        if(isNaN(critdmg)) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        percent = calculatePercent(critdmg,critdmgCap,Constants.MAX_CRITICAL_DAMAGE) + 2;
        responses.push(': `' + dec(critdmg) + '` (`' + dec(percent*100) + '%`),');
      }
      responses.push(' cap: `' + dec(critdmgCap*Constants.MAX_CRITICAL_DAMAGE) + '` (`' + (Constants.MAX_CRITICAL_DAMAGE*100+200) + '%`)');
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'defense' : {
    desc : 'Calculate in-game defense values and effective HP for each damage type.',
    usage : '<HP> <P.Def> <M.Def> [level]',
    process : (args,message,interface) => {
      if(args.length < 3) {
        interface.message.reply(message,'No value specified.');
        return;
      } else if(args.length < 5) {
        interface.message.reply(message,'Insufficient parameters. Use `' + args[0] + ' help ' + args[1] + '` for correct usage information.');
        return;
      }

      let level = (args.length>=6) ? Number.parseInt(args[5]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        interface.message.reply(message,'The specified level is invalid.');
        return;
      }
      let defCap = Constants.DEFENSE_CAPS[level-1];
      let rawHP = parseSuffix(args[2]), rawPDef = parseSuffix(args[3]), rawMDef = parseSuffix(args[4]);
      if(isNaN(rawHP) || isNaN(rawPDef) || isNaN(rawMDef) || rawHP < 0 || rawPDef < 0 || rawMDef < 0) {
        interface.message.reply(message,'The specified values are invalid.');
      }

      let percentPDef = calculatePercent(rawPDef,defCap,Constants.MAX_DEFENSE);
      let percentMDef = calculatePercent(rawMDef,defCap,Constants.MAX_DEFENSE);
      let effectivePHP = rawHP/(1-percentPDef);
      let effectiveMHP = rawHP/(1-percentMDef);
      let responses = [];
      responses.push('Level ' + level + ' defense:\n');
      responses.push('defense cap: `' + dec(defCap*Constants.MAX_DEFENSE) + '` (`' + Constants.MAX_DEFENSE*100 + '%`)\n');
      responses.push('HP: `' + rawHP + '`\n');
      responses.push('physical defense: `' + rawPDef + '` (`' + dec(percentPDef*100) + '%`)\n');
      responses.push('magic defense: `' + rawMDef + '` (`' + dec(percentMDef*100) + '%`)\n');
      responses.push('effective physical HP: `' + dec(effectivePHP) + '`\n');
      responses.push('effective magical HP: `' + dec(effectiveMHP) + '`\n');
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  },
  'finalDamage' : {
    desc : 'Calculate in-game final damage values.',
    usage : '<value[%]/cap> [level]',
    process : (args,message,interface) => {
      if(args.length < 3) {
        interface.message.reply(message,'No value specified.');
        return;
      }

      // fd: numerical value, percent: value between 0 and 1
      let fd,percent;
      let level = (args.length>=4) ? Number.parseInt(args[3]) : Constants.LEVEL;
      if(isNaN(level) || level < 1 || level > 100) {
        interface.message.reply(message,'The specified level is invalid.');
        return;
      }
      let responses = [],fdCap = Constants.FINAL_DAMAGE_CAPS[level-1];
      responses.push('Level ' + level + ' final damage');

      if(args[2].endsWith('%')) {
        percent = Number.parseFloat(args[2])/100;
        if(percent < 0) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        if(percent < 0.146) {
          fd = 2.857142857 * percent * fdCap;
        } else {
          fd = Math.pow(percent,1/2.2) * fdCap;
        }
        responses.push(': `' + dec(fd) + '` (`' + dec(percent*100) + '%`),');

      } else if(args[2] != 'cap') {
        fd = parseSuffix(args[2]);
        if(isNaN(fd)) {
          interface.message.reply(message,'The specified value is invalid.');
          return;
        }
        let ratio = fd/fdCap;
        if(ratio < 0.417) {
          percent = (0.35*fd)/fdCap;
        } else {
          percent = Math.pow(ratio,2.2);
        }

        percent = calculatePercent(percent,1,Constants.MAX_FINAL_DAMAGE);
        responses.push(': `' + dec(fd) + '` (`' + dec(percent*100) + '%`),');
      }

      responses.push(' cap: `' + dec(fdCap*Constants.MAX_FINAL_DAMAGE) + '` (`' + (Constants.MAX_FINAL_DAMAGE*100) + '%`)');
      interface.channel.sendMessage(interface.message.getChannel(message),responses.join(''));
    }
  }
};

module.exports = Dn;
