#! /usr/bin/env node

'use strict'

const { program } = require('commander')
const chalk = require('chalk')
<% if (cli === 'multiple') { %>const leven = require('leven')<% } %>
const pkg = require('../package.json')

if (pkg.private) {
  console.log(
    chalk.redBright(
      `This package ${pkg.name} has been marked as private, remove the 'private' field from the package.json to publish it.`
    )
  )
  process.exit(1)
}
<% if (cli === 'multiple') { %>
program
  .version(pkg.version, '-v, --version', 'Output the current version')
  .usage('<command> [options]')

program
  .command('command <argument>')
  .description('command description')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies')
  .action((name, options) => {
    require('../lib/index')(name, options)
  })

// output help information on unknown commands
program.arguments('<command>').action(cmd => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
})
<% } else { %>
program
  .version(pkg.version, '-v, --version', 'Output the current version')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies')
<% } %>
// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`<%= name %> <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)
<% if (multiple) { %>
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
<% } else { %>
require('../lib/index')(program._optionValues)
<% } %>
function enhanceErrorMessages(methodName, log) {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }

    this.outputHelp()

    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}
<% if (multiple) { %>
function suggestCommands (unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
<% } %>
