module.exports = [
  <% if (locals.cli) { %>
  {
    name: 'cliType',
    message: 'Does the project provide a command line?',
    type: 'list',
    default: true,
    choices: [
      {
        name: 'Yes, this project will provide only one command line',
        value: 'single',
      },
      {
        name: 'Yes, this project will provide more than one command line',
        value: 'multiple',
      }
    ],
  },
  <% } %>
  {
    name: 'platform',
    message: 'Please choose the platform of your project:',
    type: 'list',
    choices: [
      {
        name: 'github',
        value: 'github',
        source: ['./.github', '.travis.yml'],
      },
      {
        name: 'gitlab',
        value: 'gitlab',
      },
    ],
  },
]
