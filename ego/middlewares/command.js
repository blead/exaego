const commander = require('commander');
const commands = require('../../commands');

const program = new commander.Command();
commands.forEach(command => {
  if (typeof command.register === 'function') {
    command.register(program);
  } else {
    program
      .command(command.register.syntax)
      .description(command.register.description)
      .action(command.register.handler);
  }
});

function command(message, localContext) {
  const localMessage = localContext.message || {};
  const tokenizedMessage = localMessage.split(/\s+/);
  program.parse(tokenizedMessage);
  return true;
}

module.exports = command;
